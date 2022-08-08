import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
import { AbstractFormComponent } from '@app/core/components';
import { AttributeType } from '@app/data-entry/models/attribute-type.model';
import { Attribute } from '@app/data-entry/models/attribute.model';
import { Instrument, Instrument2 } from '@app/data-entry/models/instrument.model';
import { RepaymentType } from '@app/data-entry/models/repayment-type.model';
import { DataType } from '@app/data-entry/models/value-type.model';
import { AttributeService } from '@app/data-entry/services/attribute.service';
import { InstrumentVersionService } from '@app/data-entry/services/instrument-version.service';
import { InstrumentService2 } from '@app/data-entry/services/instrument2.service';
import { Person, Project } from '@app/project/models';
import { map, Observable, startWith } from 'rxjs';
import { InstrumentType } from '../../../models';
import { AttributesControlsComponent } from '../attributes-controls/attributes-controls.component';

@Component({
  selector: 'parteng-instrument-form',
  template: `
    <section class="instrument-form">
      <parteng-error-block [error]="backendError"></parteng-error-block>
      <form #instrumentForm [formGroup]="form" (ngSubmit)="submit()">
        <parteng-instrument-form-block
          [title]="'dataEntry.pageInstrumentForm.generalInfoBlock.title' | translate"
          [active]="!form.get('effectiveDate')?.value || !form.get('instrumentType')?.value"
        >
          <!-- EFFECTIVE DATE -->
          <parteng-datepicker
            [label]="'dataEntry.pageInstrumentForm.generalInfoBlock.dateLabel' | translate"
            [formControlName]="'effectiveDate'"
            [min]="'2000-01-01'"
          ></parteng-datepicker>
          <!-- INSTRUMENT TYPE -->
          <div [ngClass]="{ hidden: this.form.get('attributes')?.dirty }">
            <mat-form-field appearance="outline" class="w-96">
              <mat-label>{{
                'dataEntry.pageInstrumentForm.generalInfoBlock.instrumentTypeLabel' | translate
              }}</mat-label>
              <input
                type="text"
                matInput
                formControlName="instrumentType"
                [matAutocomplete]="auto"
                #trigger="matAutocompleteTrigger"
                (click)="form.get('instrumentType')?.setValue(''); trigger.openPanel()"
              />
              <mat-autocomplete
                #auto="matAutocomplete"
                [displayWith]="instrumentTypeDisplayer"
                (optionSelected)="onInstrumentTypeSelected($event.option.value)"
              >
                <mat-option
                  (mouseover)="onInstrumentTypeOptionMouseOver($event, instrumentType)"
                  *ngFor="let instrumentType of filteredInstrumentTypes$ | async"
                  [value]="instrumentType"
                >
                  {{ instrumentType.name }}
                </mat-option>
              </mat-autocomplete>
            </mat-form-field>
            <!-- Instrument Type comment -->
            <span class="text-gray-500 ml-3">{{ activatedInstrumentType?.comment }}</span>
          </div>
          <div [ngClass]="{ hidden: !this.form.get('attributes')?.dirty }">
            <div class="text-blue-ptg-primary">
              {{ 'dataEntry.pageInstrumentForm.generalInfoBlock.instrumentTypeLabel' | translate }}
            </div>
            <div class="font-bold">
              {{ form.get('instrumentType')?.value?.name }}
            </div>
          </div>
          <!-- Comment -->
          <mat-form-field appearance="fill" class="w-full">
            <mat-label>{{ 'dataEntry.pageInstrumentForm.comment.placeHolder' | translate }}</mat-label>
            <textarea matInput formControlName="comment" class="h-20"></textarea>
          </mat-form-field>
        </parteng-instrument-form-block>
        <!-- ATTRIBUTES -->
        <parteng-instrument-form-block
          *ngIf="form.get('effectiveDate')?.value && form.get('instrumentType')?.value; else pleaseFillGeneralInfos"
          [title]="'dataEntry.pageInstrumentForm.attributes.attributesLabel' | translate"
          [active]="true"
        >
          <parteng-attributes-controls
            #attributesControls
            [attributes]="attributes"
            [project]="project"
            [attributeTypes]="attributeTypes"
            [persons]="persons"
            [repaymentTypes]="repaymentTypes"
          ></parteng-attributes-controls>
        </parteng-instrument-form-block>
        <!-- PLEASE FILL GENERAL INFOS -->
        <ng-template #pleaseFillGeneralInfos>
          <parteng-instrument-form-block
            [title]="'dataEntry.pageInstrumentForm.attributes.attributesLabel' | translate"
          >
            <p class="italic">
              {{ 'dataEntry.pageInstrumentForm.attributes.pleaseFillGeneralInfos' | translate }}
            </p>
          </parteng-instrument-form-block>
        </ng-template>
        <!-- CANCEL/SUBMIT -->
        <div class="flex justify-end items-baseline">
          <button type="button" mat-flat-button class="mr-4" (click)="onCancel()">Annuler</button>
          <button
            type="submit"
            mat-raised-button
            color="primary"
            [disabled]="!form.valid"
            [parteng-requires-permission]="isNew ? 'create' : 'update'"
            parteng-requires-resource="instruments"
          >
            {{ 'shared.buttonLabels.validate' | translate }}
          </button>
        </div>
      </form>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InstrumentFormComponent extends AbstractFormComponent<Instrument2> {
  @Input() isNew!: boolean;
  @Input() project!: Project;
  @Input() instrument: Instrument | undefined;
  @Input() instrumentTypes!: InstrumentType[];
  @Input() attributeTypes: AttributeType[] = [];
  @Input() persons: Person[] = [];
  @Input() repaymentTypes: RepaymentType[] = [];

  @Output() instrumentTypeSelected = new EventEmitter<InstrumentType>();
  @Output() cancel = new EventEmitter<void>();

  filteredInstrumentTypes$: Observable<InstrumentType[]> | undefined;
  attributeTypes$: Observable<AttributeType[]> | undefined;
  instrumentType: InstrumentType | undefined;
  activatedInstrumentType: InstrumentType | undefined;
  attributes: Attribute[] = [];
  DataType = DataType;

  @ViewChild('attributesControls') attributesControlsComponent!: AttributesControlsComponent;

  constructor(
    private attributeService: AttributeService,
    private instrumentVersionService: InstrumentVersionService,
    private instrumentService: InstrumentService2
  ) {
    super();
  }

  buildForm(): void {
    this.form = this.fb.group({
      effectiveDate: [undefined, [Validators.required]],
      instrumentType: [undefined, Validators.required],
      comment: [undefined],
      attributes: this.fb.array([], Validators.required),
    });
    // Auto-complete
    this.filteredInstrumentTypes$ = this.form.get('instrumentType')?.valueChanges.pipe(
      startWith(''),
      map((term: string | InstrumentType) =>
        this.instrumentTypes
          .filter(
            (instrumentType) =>
              !(term instanceof InstrumentType) && instrumentType.name.toLowerCase().includes(term.toLowerCase())
          )
          .sort((a, b) => a.order - b.order)
      )
    );
  }

  override ngOnChanges(changes: SimpleChanges) {
    super.ngOnChanges(changes);
    if (changes['attributeTypes'] && changes['attributeTypes'].currentValue && this.form) {
      (this.form.get('attributes') as FormArray).clear();
      this.attributes = this.attributeTypes.map((attributeType) => this.attributeService.newAttribute(attributeType));
    }
  }

  instrumentTypeDisplayer(instrumentType?: InstrumentType): string {
    return instrumentType?.name || '';
  }

  onInstrumentTypeOptionMouseOver(_: unknown, instrumentType: InstrumentType): void {
    this.activatedInstrumentType = instrumentType;
  }

  onInstrumentTypeSelected(instrumentType: InstrumentType) {
    this.instrumentType = instrumentType;
    this.instrumentTypeSelected.emit(instrumentType);
  }

  serializeForm(): Instrument2 {
    const instrumentVersion = this.instrumentVersionService.newInstrumentVersion(
      this.project,
      this.form.get('effectiveDate')!.value,
      this.attributesControlsComponent.serialize()
    );
    return this.instrumentService.newInstrument(this.form.get('comment')?.value || '', this.instrumentType!, [
      instrumentVersion,
    ]);
  }

  onCancel() {
    this.cancel.emit();
  }
}
