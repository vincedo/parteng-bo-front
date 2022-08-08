import {
  Component,
  ChangeDetectionStrategy,
  OnChanges,
  Input,
  Output,
  EventEmitter,
  SimpleChanges,
} from '@angular/core';
import { FormControlStatus, Validators } from '@angular/forms';

import { map, Observable, of, startWith } from 'rxjs';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';

import { AbstractFormComponent } from '@app/core/components';
import { JsHelper } from '@app/core/helpers';
import { InstrumentField } from '../../store/instrument-field.state';
import { PersonField } from '../../store/person-field.state';
import { isTransferIdenticalToOriginal, Transfer, TransferType } from '../../models';
import { VALIDATION_STATUS } from '@app/shared/models';
import { MatDialog } from '@angular/material/dialog';
import { DialogWarningCustomTextComponent } from '@app/shared/components/dialog-warning-custom-text.component';

@Component({
  selector: 'parteng-transfer-form',
  templateUrl: './transfer-form.component.html',
  styleUrls: ['./transfer-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferFormComponent extends AbstractFormComponent<Transfer> implements OnChanges {
  @Input() isNew!: boolean;
  @Input() transfer!: Transfer;
  @Input() transferTypes!: TransferType[];
  @Input() instrumentFields!: InstrumentField[];
  @Input() personFields!: PersonField[];
  @Input() isPersonFieldsComplete!: boolean;
  @Input() isGeneralInfoComplete!: boolean;

  @Output() dateChanged = new EventEmitter<Date>();
  @Output() transferTypeSelected = new EventEmitter<TransferType>();
  @Output() instrumentQtyAmountChanged = new EventEmitter<{ index: number }>();
  @Output() submitThenDuplicate = new EventEmitter<Transfer>();
  @Output() duplicate = new EventEmitter<Transfer>();
  @Output() delete = new EventEmitter<Transfer>();
  @Output() cancel = new EventEmitter<void>();

  isFormInvalid!: boolean;
  minDate = new Date(2000, 0, 1);
  isDateEditable!: boolean;
  isCommentEditable!: boolean;
  isTransferTypeEditable!: boolean;
  filteredTransferTypes$!: Observable<TransferType[]>;
  hoveredTransferType: TransferType | undefined;

  VALIDATION_STATUS = VALIDATION_STATUS;

  private activeFormSection!: string;
  private qtyAmountFieldsValidityMap: { [fieldIndex: number]: boolean } = {};

  get isDeletable(): boolean {
    const canDelete = true; // @TODO: fetch user permission from backend
    return !this.isNew && this.transfer.validation_status !== VALIDATION_STATUS.VALIDATED && canDelete;
  }

  get isEditable(): boolean {
    const canUpdate = true; // @TODO: fetch user permission from backend
    return this.isNew || (!this.isNew && this.transfer.validation_status !== VALIDATION_STATUS.VALIDATED && canUpdate);
  }

  get canDuplicateTransfer(): boolean {
    return (
      this.transfer.parentProject.validation_status === VALIDATION_STATUS.NOT_REVIEWED &&
      this.transfer.parentFolder.validation_status === VALIDATION_STATUS.NOT_REVIEWED
    );
  }

  constructor(private dialog: MatDialog) {
    super();
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    // The current form may be updated from state changes
    if (changes['transfer'] && !changes['transfer'].firstChange) {
      this.updateForm();
    }
    // any change in inputs may change the form validity
    this.computeIsFormInvalid();
  }

  buildForm(): void {
    this.form = this.fb.group({
      date: [this.transfer.date, Validators.required],
      transferType: [this.transfer.transferType, Validators.required],
      comment: [this.transfer.comment],
    });
    this.updateForm(!!this.transfer.duplicateOf);

    this.setupTransferTypeAutocomplete();
    this.isDateEditable = !this.transfer.date;
  }

  private updateForm(markAsDirty = true): void {
    this.form.patchValue(this.transfer);

    // without this, form doesn't "see" updates from state
    if (markAsDirty) {
      this.form.markAsDirty();
    }
  }

  private computeIsFormInvalid(): void {
    const qtyAmountFieldsValidities: boolean[] = Object.values(this.qtyAmountFieldsValidityMap);
    const isqtyAmountFieldsInvalid = qtyAmountFieldsValidities.some((isValid) => !isValid);

    this.isFormInvalid =
      this.form?.invalid || !this.isGeneralInfoComplete || !this.isPersonFieldsComplete || isqtyAmountFieldsInvalid;
  }

  serializeForm(): Transfer {
    const formData = this.form!.value;

    // IMPORTANT. All other properties have already been updated in `this.transfer`
    const transfer = this.transfer.clone({
      comment: formData.comment,
    });

    return transfer;
  }

  override submit(): void {
    const promptContinue$ = () => {
      const dialogRef = this.dialog.open<DialogWarningCustomTextComponent, any, boolean>(
        DialogWarningCustomTextComponent,
        {
          data: {
            dialogTitleTranslateKey: 'dataEntry.pageTransferForm.dialogDuplicateWarning.title',
            dialogDescriptionTranslateKey: 'dataEntry.pageTransferForm.dialogDuplicateWarning.description',
          },
        }
      );
      return dialogRef.afterClosed().pipe(map(Boolean));
    };

    // Check that the original transfer, if any, is not identical to the current one
    // If it is, warn the user that they will create a double
    const doContinue$ =
      this.transfer.duplicateOf && isTransferIdenticalToOriginal(this.transfer) ? promptContinue$() : of(true);

    doContinue$.subscribe((doContinue) => {
      if (doContinue) {
        super.submit();
      }
    });
  }

  onDateChanged(event: MatDatepickerInputEvent<Date>): void {
    if (event.value) {
      this.isDateEditable = false;
      this.dateChanged.emit(event.value as Date);
    }
  }

  makeDateEditable(): void {
    this.isDateEditable = true;
  }

  makeTransferTypeEditable(): void {
    this.isTransferTypeEditable = true;
  }

  onTransferTypeMouseOver(_: unknown, transferType?: TransferType): void {
    this.hoveredTransferType = transferType;
  }

  onTransferTypeSelected(event: MatAutocompleteSelectedEvent): void {
    this.isTransferTypeEditable = false;
    this.transferTypeSelected.emit(event.option.value);
  }

  makeCommentEditable(): void {
    this.isCommentEditable = true;
  }

  onQtyAmountFieldStatusChanged(info: { index: number; status: FormControlStatus }): void {
    this.qtyAmountFieldsValidityMap[info.index] = info.status === 'VALID';
    this.computeIsFormInvalid();
  }

  clickSubmitThenDuplicate(): void {
    const transfer = this.serializeForm();
    this.submitThenDuplicate.emit(transfer);
  }

  clickDuplicate(): void {
    const transfer = this.serializeForm();
    this.duplicate.emit(transfer);
  }

  clickCancel(): void {
    this.cancel.emit();
  }

  clickDelete(): void {
    const transfer = this.serializeForm();
    this.delete.emit(transfer);
  }

  displayTransferTypeFn(transferType: TransferType): string {
    return transferType && transferType.name ? transferType.name : '';
  }

  activateFormSection(sectionId: string): void {
    this.activeFormSection = sectionId;
  }

  isFormSectionActive(sectionId: string): boolean {
    return this.activeFormSection === sectionId;
  }

  private setupTransferTypeAutocomplete(): void {
    this.filteredTransferTypes$ = this.form.get('transferType')!.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  private _filter(value: string): TransferType[] {
    return typeof value === 'string'
      ? this.transferTypes.filter((transferType) => JsHelper.strContainsStr(transferType.name, value))
      : [...this.transferTypes];
  }
}
