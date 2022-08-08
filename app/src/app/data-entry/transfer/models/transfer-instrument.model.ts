import { Instrument2 } from '@app/data-entry/models/instrument.model';
import { EntityWithId, EntityWithIdDto } from '@app/shared/models';
import { OwnershipType } from './ownership-type.model';

export interface TransferInstrumentDto extends EntityWithIdDto {
  instruments_id: number;
  transfers_id: number;
  instrument_number: number;

  quantity: string;
  accounting_unit_value: string;
  accounting_total_amount: string;
  actual_unit_value: string;
  actual_total_amount: string;

  input_quantity: string;
  input_accounting_unit_value: string;
  input_accounting_total_amount: string;
  input_actual_unit_value: string;
  input_actual_total_amount: string;

  // frontend props
  $instrument: Instrument2;
  $instrumentDesignation: string;
  $ownershipType: OwnershipType;
}

export class TransferInstrument extends EntityWithId {
  instruments_id: number;
  transfers_id: number;
  instrument_number: number;

  quantity: string | undefined;
  accounting_unit_value: string | undefined;
  accounting_total_amount: string | undefined;
  actual_unit_value: string | undefined;
  actual_total_amount: string | undefined;

  input_quantity: string | undefined;
  input_accounting_unit_value: string | undefined;
  input_accounting_total_amount: string | undefined;
  input_actual_unit_value: string | undefined;
  input_actual_total_amount: string | undefined;

  // frontend props
  $instrument: Instrument2;
  $instrumentDesignation: string;
  $ownershipType: OwnershipType;

  constructor(opts: Partial<TransferInstrumentDto> = {}) {
    super(opts);

    this.instruments_id = opts.instruments_id!;
    this.transfers_id = opts.transfers_id!;
    this.instrument_number = opts.instrument_number!;

    // Computed values
    this.quantity = opts.quantity;
    this.accounting_unit_value = opts.accounting_unit_value;
    this.accounting_total_amount = opts.accounting_total_amount;
    this.actual_unit_value = opts.actual_unit_value;
    this.actual_total_amount = opts.actual_total_amount;

    this.input_quantity = opts.input_quantity;
    this.input_accounting_total_amount = opts.input_accounting_total_amount;
    this.input_accounting_unit_value = opts.input_accounting_unit_value;
    this.input_actual_unit_value = opts.input_actual_unit_value;
    this.input_actual_total_amount = opts.input_actual_total_amount;

    this.$instrument = opts.$instrument!;
    this.$instrumentDesignation = opts.$instrumentDesignation!;
    this.$ownershipType = opts.$ownershipType!;
  }

  clone(opts: Partial<TransferInstrumentDto> = {}): TransferInstrument {
    const clone = new TransferInstrument({
      ...this.cloneEntityProps(opts),

      instruments_id: opts.instruments_id || this.instruments_id,
      transfers_id: opts.transfers_id !== undefined ? opts.transfers_id : this.transfers_id, // this value could be reset with a "null"
      instrument_number: opts.instrument_number || this.instrument_number,

      quantity: opts.quantity || this.quantity,
      accounting_unit_value: opts.accounting_unit_value || this.accounting_unit_value,
      accounting_total_amount: opts.accounting_total_amount || this.accounting_total_amount,
      actual_unit_value: opts.actual_unit_value || this.actual_unit_value,
      actual_total_amount: opts.actual_total_amount || this.actual_total_amount,

      input_quantity: opts.input_quantity || this.input_quantity,
      input_accounting_total_amount: opts.input_accounting_total_amount || this.input_accounting_total_amount,
      input_accounting_unit_value: opts.input_accounting_unit_value || this.input_accounting_unit_value,
      input_actual_unit_value: opts.input_actual_unit_value || this.input_actual_unit_value,
      input_actual_total_amount: opts.input_actual_total_amount || this.input_actual_total_amount,

      $instrument: opts.$instrument || this.$instrument,
      $instrumentDesignation: opts.$instrumentDesignation || this.$instrumentDesignation,
      $ownershipType: opts.$ownershipType || this.$ownershipType,
    });

    return clone;
  }
}
