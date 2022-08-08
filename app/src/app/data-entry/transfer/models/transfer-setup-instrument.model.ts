import { EntityWithId, EntityWithIdDto } from '@app/shared/models';

export interface TransferSetupInstrumentDto extends EntityWithIdDto {
  setup_transfers_id: number;
  instrument_types_id: number;
  instrument_number: number;
  ownership_types_id: number;
  instrument_designation: string;

  input_designation_quantity: string;
  input_designation_accounting_unit_value: string;
  input_designation_accounting_total_amount: string;
  input_designation_actual_unit_value: string;
  input_designation_actual_total_amount: string;

  input_fixed_value_quantity: number;
  input_fixed_value_accounting_unit_value: number;
  input_fixed_value_accounting_total_amount: number;
  input_fixed_value_actual_unit_value: number;
  input_fixed_value_actual_total_amount: number;
}

export class TransferSetupInstrument extends EntityWithId {
  setup_transfers_id: number;
  instrument_types_id: number;
  instrument_number: number;
  ownership_types_id: number;
  instrument_designation: string;

  input_designation_quantity: string | undefined;
  input_designation_accounting_unit_value: string | undefined;
  input_designation_accounting_total_amount: string | undefined;
  input_designation_actual_unit_value: string | undefined;
  input_designation_actual_total_amount: string | undefined;

  input_fixed_value_quantity: number | undefined;
  input_fixed_value_accounting_unit_value: number | undefined;
  input_fixed_value_accounting_total_amount: number | undefined;
  input_fixed_value_actual_unit_value: number | undefined;
  input_fixed_value_actual_total_amount: number | undefined;

  constructor(opts: Partial<TransferSetupInstrumentDto> = {}) {
    super(opts);

    this.setup_transfers_id = opts.setup_transfers_id!;
    this.instrument_types_id = opts.instrument_types_id!;
    this.instrument_number = opts.instrument_number!;
    this.ownership_types_id = opts.ownership_types_id!;
    this.instrument_designation = opts.instrument_designation!;

    this.input_designation_quantity = opts.input_designation_quantity;
    this.input_designation_accounting_unit_value = opts.input_designation_accounting_unit_value;
    this.input_designation_accounting_total_amount = opts.input_designation_accounting_total_amount;
    this.input_designation_actual_unit_value = opts.input_designation_actual_unit_value;
    this.input_designation_actual_total_amount = opts.input_designation_actual_total_amount;
    this.input_fixed_value_accounting_total_amount = opts.input_fixed_value_accounting_total_amount;
    this.input_fixed_value_accounting_unit_value = opts.input_fixed_value_accounting_unit_value;
    this.input_fixed_value_actual_unit_value = opts.input_fixed_value_actual_unit_value;
    this.input_fixed_value_quantity = opts.input_fixed_value_quantity;
    this.input_fixed_value_actual_total_amount = opts.input_fixed_value_actual_total_amount;
  }
}
