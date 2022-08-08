import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnInit,
  ViewEncapsulation,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, FormControlStatus, FormGroup, Validators } from '@angular/forms';

import { Store } from '@ngrx/store';
import { map, Subscription, tap } from 'rxjs';

import { TransferSetupInstrument, TransferInstrument, TransferInstrumentQtyAmount } from '../../models';
import * as transferActions from '../../store/transfer.actions';

@Component({
  selector: 'parteng-transfer-qty-amount-field',
  templateUrl: './transfer-qty-amount-field.component.html',
  styleUrls: ['./transfer-qty-amount-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TransferQtyAmountFieldComponent implements OnInit, OnDestroy {
  @Input() index!: number;
  @Input() setupInstrument!: TransferSetupInstrument;
  @Input() transferInstrument!: TransferInstrument;
  @Input() isEditMode!: boolean;
  @Input() isEditable = true;
  @Input() isActive!: boolean;

  @Output() activate = new EventEmitter<void>();
  @Output() fieldStatusChanged = new EventEmitter<{ index: number; status: FormControlStatus }>();

  form!: FormGroup;

  private subs: Subscription[] = [];

  constructor(private fb: FormBuilder, private store: Store) {}

  ngOnInit(): void {
    this.buildForm();
  }

  ngOnDestroy(): void {
    this.subs.forEach((sub) => sub.unsubscribe());
  }

  edit(): void {
    this.isEditMode = true;
    this.activateForm();
  }

  activateForm(): void {
    this.activate.emit();
  }

  private buildForm(): void {
    // Note. The values exposed in the form are the ones the user initially entered, aka "input_" properties.
    const {
      input_quantity,
      input_accounting_unit_value,
      input_accounting_total_amount,
      input_actual_unit_value,
      input_actual_total_amount,
    } = this.transferInstrument;
    const toNumber = (val: string | undefined) => (typeof val === 'string' ? Number(val) : val);

    // Return validators dynamically based on whether the field is required or not
    const requiredFields = this.getRequiredFields();
    // 27-FEB-2022: No validtors for now
    const getValidators = (fieldName: string) => (requiredFields.includes(fieldName) ? [Validators.required] : []);

    this.form = this.fb.group({
      input_quantity: [toNumber(input_quantity)],
      input_accounting_unit_value: [toNumber(input_accounting_unit_value)],
      input_accounting_total_amount: [toNumber(input_accounting_total_amount)],
      input_actual_unit_value: [toNumber(input_actual_unit_value)],
      input_actual_total_amount: [toNumber(input_actual_total_amount)],
    });

    // Inform parent component of local status changes
    // so we can update the main form's validity.
    const sub = this.form.statusChanges.subscribe((status) =>
      this.fieldStatusChanged.emit({ index: this.index, status })
    );
    this.subs.push(sub);

    // Dispatch data changes directly to the store.
    // We do that instead of emitting to parent in order to stay aligned
    // with the behavior of the other fields in the parent form.
    // (i.e. TransferInstrumentFieldComponent, TransferPersonFieldComponent)
    const sub2 = this.form.valueChanges
      .pipe(
        map((value) => processFormData(value)),
        tap((qtyAmount) =>
          this.store.dispatch(
            transferActions.updateTransferInstrumentQtyAmount({ instrumentIndex: this.index, qtyAmount })
          )
        )
      )
      .subscribe();

    this.subs.push(sub2);

    // Disable fixed value fields and set their values
    const fixedValueFields = this.getFixedValueFields();
    for (const fieldName of Object.keys(fixedValueFields)) {
      this.form.get(fieldName)?.patchValue(fixedValueFields[fieldName]);
      this.form.get(fieldName)?.disable();
    }
  }

  /**
   * Inspect the current TransferSetupInstrument to return a list of the fields
   * that should be required in the form, i.e. fields whose "designation" prop is set.
   */
  private getRequiredFields(): string[] {
    const designationProps: Array<keyof TransferSetupInstrument> = [
      'input_designation_quantity',
      'input_designation_accounting_unit_value',
      'input_designation_accounting_total_amount',
      'input_designation_actual_unit_value',
      'input_designation_actual_total_amount',
    ];
    return designationProps
      .filter((prop) => typeof this.setupInstrument[prop] === 'string')
      .map((prop) => designationPropNameToFieldName(prop));
  }

  /**
   * Inspect the current TransferSetupInstrument to return an object where the keys
   * are the names of fields with fixed values and the object values are the fixed values.
   */
  private getFixedValueFields(): { [k: string]: number } {
    const fixedValueProps: Array<keyof TransferSetupInstrument> = [
      'input_fixed_value_quantity',
      'input_fixed_value_accounting_unit_value',
      'input_fixed_value_accounting_total_amount',
      'input_fixed_value_actual_unit_value',
      'input_fixed_value_actual_total_amount',
    ];

    const fixedValueFields: { [k: string]: number } = {};
    for (const prop of fixedValueProps) {
      const propValue = this.setupInstrument[prop];
      if (typeof propValue === 'number') {
        const fieldName = fixedValuePropNameToFieldName(prop);
        fixedValueFields[fieldName] = propValue;
      }
    }

    return fixedValueFields;
  }
}

//
//
//

/**
 * Convert the name of a fixed value property to a field name,
 * e.g. "input_fixed_value_accounting_unit_value" ==> "accounting_unit_value"
 */
function fixedValuePropNameToFieldName(propName: string): string {
  return propName.replace('input_fixed_value_', '');
}

/**
 * Convert the name of a designation property to a field name,
 * e.g. "input_designation_accounting_unit_value" ==> "accounting_unit_value"
 */
function designationPropNameToFieldName(propName: string): string {
  return propName.replace('input_designation_', '');
}

/**
 * Process form data by stringifying numbers.
 */
function processFormData(data: any): TransferInstrumentQtyAmount {
  const toString = (val: any) => (val !== null ? `${val}` : val);

  const qtyAmount: TransferInstrumentQtyAmount = {
    input_quantity: toString(data.input_quantity),
    input_accounting_unit_value: toString(data.input_accounting_unit_value),
    input_accounting_total_amount: toString(data.input_accounting_total_amount),
    input_actual_unit_value: toString(data.input_actual_unit_value),
    input_actual_total_amount: toString(data.input_actual_total_amount),
  };

  return qtyAmount;
}
