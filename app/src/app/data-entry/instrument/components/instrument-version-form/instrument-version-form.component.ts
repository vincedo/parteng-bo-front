import { Component, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormArray, Validators } from '@angular/forms';
import { AbstractFormComponent } from '@app/core/components';
import { AttributeType } from '@app/data-entry/models/attribute-type.model';
import { Attribute } from '@app/data-entry/models/attribute.model';
import { InstrumentVersion } from '@app/data-entry/models/instrument-version.model';
import { Instrument2 } from '@app/data-entry/models/instrument.model';
import { RepaymentType } from '@app/data-entry/models/repayment-type.model';
import { DataType } from '@app/data-entry/models/value-type.model';
import { InstrumentVersionService } from '@app/data-entry/services/instrument-version.service';
import { InstrumentService2 } from '@app/data-entry/services/instrument2.service';
import { ValueTypeService } from '@app/data-entry/services/value-type.service';
import { Person, Project } from '@app/project/models';
import { VALIDATION_STATUS } from '@app/shared/models';
import { AttributesControlsComponent } from '../attributes-controls/attributes-controls.component';
import { PermissionService } from '@core/services/permission.service';

@Component({
  selector: 'parteng-instrument-version-form',
  template: `
    <section class="instrument-form">
      <parteng-error-block [error]="backendError"></parteng-error-block>
      <form #instrumentForm [formGroup]="form" (ngSubmit)="submit()">
        <parteng-instrument-form-block [title]="'dataEntry.instrumentVersionForm.generalInfoBlock.title' | translate">
          <!-- EFFECTIVE DATE -->
          <div *ngIf="!isNew" class="mt-3 text-blue-ptg-primary font-semibold">
            {{ 'dataEntry.instrumentVersionForm.generalInfoBlock.dateLabel' | translate }}
            <mat-icon
              class="ml-2 text-neutral-500 cursor-pointer"
              *ngIf="canEdit()"
              (click)="isEditingEffectiveDate = true"
              parteng-requires-permission="update"
              parteng-requires-resource="instrument-versions"
              >edit</mat-icon
            >
          </div>
          <div [ngClass]="{ hidden: isEditingEffectiveDate }">
            {{ instrumentVersion?.effectiveDate | date: 'shortDate' }}
          </div>
          <mat-form-field
            appearance="outline"
            (click)="picker.open()"
            [ngClass]="{ hidden: !isEditingEffectiveDate && !isNew }"
          >
            <mat-label>{{ 'dataEntry.instrumentVersionForm.generalInfoBlock.dateLabel' | translate }}</mat-label>
            <input
              [formControlName]="'effectiveDate'"
              matInput
              [matDatepicker]="picker"
              (dateChange)="onDateChange($event.value)"
              autocomplete="off"
              readonly="readonly"
            />
            <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
            <mat-datepicker #picker></mat-datepicker>
          </mat-form-field>
          <!-- PROJECT -->
          <ng-container *ngIf="!isNew">
            <div class="mt-5 text-blue-ptg-primary font-semibold">
              {{ 'dataEntry.instrumentVersionForm.generalInfoBlock.creationProject' | translate }}
            </div>
            <div>
              {{ instrumentVersion.creationProject?.longName }}
            </div>
          </ng-container>
          <!-- CHANGES -->
          <ng-container *ngIf="isNew || (instrumentVersion && instrumentVersion.order !== 1); else v1Changes">
            <div *ngIf="!isNew" class="mt-3 text-blue-ptg-primary font-semibold">
              {{ 'dataEntry.instrumentVersionForm.generalInfoBlock.changes' | translate }}*
              <mat-icon
                *ngIf="canEdit()"
                class="ml-2 text-neutral-500 cursor-pointer"
                (click)="isEditingChanges = true"
                parteng-requires-permission="update"
                parteng-requires-resource="instrument-versions"
                >edit</mat-icon
              >
            </div>
            <div [ngClass]="{ hidden: isEditingChanges || isNew }">
              {{ instrumentVersion?.changes }}
            </div>
            <mat-form-field [ngClass]="{ hidden: !isEditingChanges && !isNew }" appearance="fill" class="w-full p-2">
              <mat-label>{{ 'dataEntry.instrumentVersionForm.generalInfoBlock.changes' | translate }}</mat-label>
              <textarea
                class="h-20"
                autocomplete="on"
                matInput
                [ngClass]="{ hidden: !isEditingChanges && !isNew }"
                formControlName="changes"
                [placeholder]="'dataEntry.instrumentVersionForm.generalInfoBlock.changes' | translate"
                required
              ></textarea>
            </mat-form-field>
          </ng-container>
          <ng-template #v1Changes>
            <div class="mt-5 text-blue-ptg-primary font-semibold">
              {{ 'dataEntry.instrumentVersionForm.generalInfoBlock.changes' | translate }}
            </div>
            {{ 'dataEntry.instrumentVersionForm.generalInfoBlock.changesV1' | translate }}
          </ng-template>
        </parteng-instrument-form-block>
        <!-- ATTRIBUTES -->
        <parteng-instrument-form-block
          *ngIf="attributes && attributes.length > 0; else pleaseFillGeneralInfos"
          [title]="'dataEntry.instrumentVersionForm.attributes.attributesLabel' | translate"
        >
          <parteng-attributes-controls
            [isNew]="isNew"
            #attributesControls
            [attributes]="attributes"
            [project]="project"
            [instrument]="instrument"
            [instrumentVersion]="instrumentVersion"
            [previousVersion]="previousVersion"
            [attributeTypes]="attributeTypes"
            [persons]="persons"
            [instruments]="instruments"
            [repaymentTypes]="repaymentTypes"
            [readonly]="
              !canEdit() || (this.permissionService.isAuthorized$('update', 'instrument-versions') | async) === false
            "
          ></parteng-attributes-controls>
        </parteng-instrument-form-block>
        <!-- PLEASE FILL GENERAL INFOS -->
        <ng-template #pleaseFillGeneralInfos>
          <parteng-instrument-form-block
            [title]="'dataEntry.instrumentVersionForm.attributes.attributesLabel' | translate"
          >
            <p class="italic">
              {{ 'dataEntry.instrumentVersionForm.attributes.pleaseFillGeneralInfos' | translate }}
            </p>
          </parteng-instrument-form-block>
        </ng-template>

        <div class="flex justify-end items-baseline">
          <div *ngIf="canEdit(); else viewOnly">
            <!-- CANCEL BUTTON -->
            <button type="button" mat-flat-button class="mr-4" (click)="onCancel()">
              {{ 'dataEntry.instrumentVersionForm.cancel' + (isNew ? 'New' : '') | translate }}
            </button>
            <!-- DELETE BUTTON -->
            <button
              *ngIf="!isNew"
              type="button"
              class="mr-4"
              mat-stroked-button
              color="warn"
              (click)="onDeleteInstrumentVersionClick()"
              parteng-requires-permission="delete"
              parteng-requires-resource="instrument-versions"
              data-testId="version-delete-button"
            >
              {{ 'dataEntry.instrumentVersionForm.delete' | translate }}
            </button>
            <!-- SUBMIT BUTTON -->
            <button type="submit" mat-raised-button color="primary" [disabled]="!form.valid || !form.dirty">
              {{ 'dataEntry.instrumentVersionForm.validate' + (isNew ? 'New' : 'Update') | translate }}
            </button>
          </div>
          <ng-template #viewOnly>
            <button type="button" mat-flat-button class="mr-4" (click)="onCancel()">
              {{ 'dataEntry.instrumentVersionForm.cancel' | translate }}
            </button>
          </ng-template>
        </div>
      </form>
    </section>
  `,
})
export class InstrumentVersionFormComponent extends AbstractFormComponent<InstrumentVersion> {
  @Input() isNew: boolean = false;
  @Input() project: Project | undefined;
  @Input() instrument!: Instrument2;
  @Input() instrumentVersion!: InstrumentVersion;
  @Input() attributeTypes: AttributeType[] = [];
  @Input() persons: Person[] = [];
  @Input() instruments: Instrument2[] = [];
  @Input() repaymentTypes: RepaymentType[] = [];
  @Input() readonly: boolean | undefined = false;

  @Output() deleteVersion = new EventEmitter();
  @Output() cancel = new EventEmitter();

  isEditingChanges = false;
  isEditingEffectiveDate = false;
  DataType = DataType;
  attributes: Attribute[] = [];
  previousVersion: InstrumentVersion | undefined;

  @ViewChild('attributesControls') attributesControlsComponent!: AttributesControlsComponent;

  constructor(
    private instrumentService: InstrumentService2,
    private instrumentVersionService: InstrumentVersionService,
    public valueTypeService: ValueTypeService,
    public readonly permissionService: PermissionService
  ) {
    super();
  }

  buildForm(): void {
    this.form = this.fb.group({
      effectiveDate: [undefined, [Validators.required]],
      changes: [undefined, this.instrumentVersion && this.instrumentVersion.order !== 1 ? [Validators.required] : []],
      // changes: ['', [Validators.required]],
      attributes: this.fb.array([]),
    });
    this.updateForm(false);
  }

  override ngOnInit() {
    super.ngOnInit();
    if (!this.isNew) {
      this.attributes = this.instrumentVersion.attributes;
    }
    this.form.get('changes')!.markAsTouched();
  }

  canEdit(): boolean {
    return !this.readonly && (this.isNew || this.instrumentVersion.validationStatus === VALIDATION_STATUS.NOT_REVIEWED);
  }

  canDeleteInstrumentVersion(): boolean {
    return (
      !this.readonly &&
      this.instrumentVersion.order !== 1 &&
      !this.isNew &&
      this.instrumentVersion.validationStatus === VALIDATION_STATUS.NOT_REVIEWED
    );
  }

  onDateChange(date: Date): void {
    if (!this.isNew) {
      return;
    }
    if (this.isEffectiveDateValid(date)) {
      this.previousVersion = this.instrumentService.getFirstVersionBefore(this.instrument, date);
      if (!this.previousVersion) {
        throw new Error('No previous version found');
      }
      (this.form.get('attributes') as FormArray).clear();
      this.attributes = this.previousVersion.attributes;
    } else {
      // TODO: improve to avoid cyclomatic complexity
      this.form.get('effectiveDate')!.setErrors({ invalid: true });
    }
  }

  isEffectiveDateValid(date: Date): boolean {
    const firstVersion = (this.instrument.instrumentVersions || []).find((version) => version.order === 1);
    if (!firstVersion) {
      throw new Error('First version not found');
    }
    return date.getTime() >= firstVersion.effectiveDate!.getTime();
  }

  private updateForm(markAsDirty = true): void {
    this.form.patchValue(this.instrumentVersion);
    if (markAsDirty) {
      this.form.markAsDirty();
    }
  }

  async onDeleteInstrumentVersionClick() {
    this.deleteVersion.emit();
  }

  serializeForm(): InstrumentVersion {
    if (this.isNew) {
      const instrumentVersion = this.instrumentVersionService.newInstrumentVersion(
        this.project!,
        this.form.get('effectiveDate')!.value,
        this.attributesControlsComponent.serialize()
      );
      instrumentVersion.instrumentId = this.instrument.id;
      instrumentVersion.changes = this.form.get('changes')!.value;
      return instrumentVersion;
    } else {
      this.instrumentVersion.effectiveDate = this.form.get('effectiveDate')!.value;
      this.instrumentVersion.changes = this.form.get('changes')!.value;
      this.instrumentVersion.attributes = this.attributesControlsComponent.serialize();
      return this.instrumentVersion;
    }
  }

  onCancel() {
    this.cancel.emit();
  }
}
