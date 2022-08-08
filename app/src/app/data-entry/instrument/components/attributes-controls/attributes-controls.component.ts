import { ChangeDetectorRef, Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { ControlContainer, FormArray, FormControl, FormGroupDirective, ValidatorFn, Validators } from '@angular/forms';
import { JsHelper } from '@app/core/helpers';
import { AttributeType } from '@app/data-entry/models/attribute-type.model';
import { Attribute } from '@app/data-entry/models/attribute.model';
import { InstrumentVersion } from '@app/data-entry/models/instrument-version.model';
import { Instrument2 } from '@app/data-entry/models/instrument.model';
import { RepaymentType } from '@app/data-entry/models/repayment-type.model';
import { DataType } from '@app/data-entry/models/value-type.model';
import { AttributeService } from '@app/data-entry/services/attribute.service';
import { InstrumentService2 } from '@app/data-entry/services/instrument2.service';
import { ValueTypeService } from '@app/data-entry/services/value-type.service';
import { Person, Project } from '@app/project/models';
import { PersonService } from '@app/project/services/person.service';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';

interface AttributeControl {
  attribute: Attribute;
  attributeType: AttributeType;
  control: FormControl;
  isEditing: boolean;
}

@Component({
  selector: 'parteng-attributes-controls',
  templateUrl: './attributes-controls.component.html',
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective,
    },
  ],
})
export class AttributesControlsComponent implements OnInit, OnChanges {
  @Input() readonly: boolean = false;
  @Input() isNew = true;
  @Input() attributes: Attribute[] = [];
  @Input() project: Project | undefined;
  @Input() instrument!: Instrument2;
  @Input() instrumentVersion!: InstrumentVersion;
  @Input() previousVersion: InstrumentVersion | undefined;
  @Input() attributeTypes: AttributeType[] = [];
  @Input() persons: Person[] = [];
  @Input() instruments: Instrument2[] = [];
  @Input() repaymentTypes: RepaymentType[] = [];

  attributesControls: AttributeControl[] = [];
  DataType = DataType;

  isCreatingInstrument: boolean = false;
  isCreatingVersion: boolean = false;
  isUpdatingVersion: boolean = false;

  constructor(
    private parentForm: FormGroupDirective,
    private instrumentService: InstrumentService2,
    public valueTypeService: ValueTypeService,
    private personService: PersonService,
    private attributeService: AttributeService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.isCreatingVersion = !!this.previousVersion;
    this.isUpdatingVersion = !!this.instrumentVersion;
    this.isCreatingInstrument = !this.isCreatingVersion && !this.isUpdatingVersion;
  }

  canShowPreviousValue(attributeControl: AttributeControl): boolean {
    return !!this.previousVersion && attributeControl.attributeType.modifiable;
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['attributes'] && changes['attributes'].currentValue) {
      this.attributesControls = this.attributes.map((attribute) => {
        const attributeType = attribute.attributeType;
        const person = attribute.personId ? this.persons.find((p) => p.id === attribute.personId) : undefined;
        const instrument = attribute.instrumentId
          ? this.instruments.find((i) => i.id === attribute.instrumentId)
          : undefined;
        const date =
          attributeType.valueType.dataType === this.valueTypeService.getDataTypeId(DataType.DATE) &&
          attribute.scalarValue
            ? new Date(attribute.scalarValue as string)
            : undefined;
        return {
          attribute,
          attributeType,
          control: new FormControl(
            {
              value: date || attribute.scalarValue || person || instrument || attribute.repaymentTypeId,
              disabled: !attributeType.modifiable && !this.isCreatingInstrument,
            },
            this.getAttributeValidators(attributeType)
          ),
          isEditing: false,
        };
      });
      this.attributesControls.forEach((attributeControl) => {
        (this.parentForm.form.get('attributes') as FormArray).push(attributeControl.control);
      });
    }
  }

  private getAttributeValidators(attributeType: AttributeType): ValidatorFn[] {
    const validators = [];
    if (!attributeType.nullable) {
      validators.push(Validators.required);
    }
    if (attributeType.valueType.dataType === this.valueTypeService.getDataTypeId(DataType.INT)) {
      validators.push(Validators.pattern(/^\d*$/));
    }
    if (attributeType.valueType.dataType === this.valueTypeService.getDataTypeId(DataType.FLOAT)) {
      validators.push(Validators.pattern(/^[\d\.]*$/));
    }
    return validators;
  }

  booleanText(v: unknown): string {
    return this.translateService.instant(!!v ? 'dataEntry.attributesForm.Yes' : 'dataEntry.attributesForm.No');
  }

  asNumber(value: unknown): number {
    return value as number;
  }

  getPreviousVersionAttribute(attributeControl: AttributeControl): Attribute | undefined {
    return this.previousVersion?.attributes.find((a) => a.attributeType.id === attributeControl.attributeType.id);
  }

  getRepaymentTypeById(id: number): RepaymentType | undefined {
    return this.repaymentTypes.find((r) => r.id === id);
  }

  getAttributeDateValue(attribute: Attribute): Date {
    return new Date(attribute.scalarValue as string);
  }

  async onSelectPersonButtonClick(attributeControl: AttributeControl): Promise<void> {
    const persons: Person[] | undefined = await lastValueFrom(
      this.personService.showPersonSelectorDialog({
        project: this.project!,
        selectedPersons: this.persons,
        title: 'dataEntry.pageInstrumentForm.personSelectorDialog.title',
        titleName: attributeControl.attributeType.name,
        description: 'dataEntry.pageInstrumentForm.personSelectorDialog.description',
      })
    );
    if (persons) {
      attributeControl.control.setValue(persons[0]);
      attributeControl.control.markAsDirty();
      this.cdr.markForCheck();
    }
  }

  async onSelectInstrumentButtonClick(attributeControl: AttributeControl): Promise<void> {
    const instruments: Instrument2[] | undefined = await lastValueFrom(
      this.instrumentService.showInstrumentSelectorDialog({
        title: this.translateService.instant('dataEntry.dialogInstrumentSelector.title'),
        description: this.translateService.instant('dataEntry.dialogInstrumentSelector.description'),
      })
    );
    if (instruments) {
      attributeControl.control.setValue(instruments[0]);
      attributeControl.control.markAsDirty();
      this.cdr.markForCheck();
    }
  }

  serialize(): Attribute[] {
    const valueGetters = {
      [this.valueTypeService.getDataTypeId(DataType.TEXT)]: (c: FormControl): string => c.value,
      [this.valueTypeService.getDataTypeId(DataType.INT)]: (c: FormControl): number => c.value,
      [this.valueTypeService.getDataTypeId(DataType.FLOAT)]: (c: FormControl): number => c.value,
      [this.valueTypeService.getDataTypeId(DataType.BOOLEAN)]: (c: FormControl): boolean => !!c.value,
      [this.valueTypeService.getDataTypeId(DataType.DATE)]: (c: FormControl): string =>
        JsHelper.dateToYMD(c.value as Date),
      [this.valueTypeService.getDataTypeId(DataType.PERSON)]: (c: FormControl): Person => c.value,
      [this.valueTypeService.getDataTypeId(DataType.INSTRUMENT)]: (c: FormControl): Instrument2 => c.value,
      [this.valueTypeService.getDataTypeId(DataType.REPAYMENT_TYPE)]: (c: FormControl): RepaymentType =>
        this.getRepaymentTypeById(c.value as number)!,
      [this.valueTypeService.getDataTypeId(DataType.CONTRACT_EVENT)]: (c: FormControl): string => c.value,
    };
    return this.attributesControls.map((attributeControl) =>
      this.attributeService.newAttribute(
        attributeControl.attributeType,
        this.instrumentVersion,
        valueGetters[attributeControl.attributeType.valueType.dataType](attributeControl.control),
        attributeControl?.attribute.id
      )
    );
  }
}
