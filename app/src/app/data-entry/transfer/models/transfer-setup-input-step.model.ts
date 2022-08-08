import { EntityWithId, EntityWithIdDto } from '@app/shared/models';

export interface TransferSetupInputStepDto extends EntityWithIdDto {
  level: number;
  previous_id: number;
  transfer_types_id: number;
  previous_instrument_types_id: number;
  previous_ownership_types_id: number;
  instrument_designation: string;
  setup_transfers_id: number;
}

export class TransferSetupInputStep extends EntityWithId {
  level: number;
  previous_id: number | undefined;
  transfer_types_id: number | undefined;
  previous_instrument_types_id: number | undefined;
  previous_ownership_types_id: number | undefined;
  instrument_designation: string | undefined;
  setup_transfers_id: number | undefined;

  constructor(opts: Partial<TransferSetupInputStepDto> = {}) {
    super(opts);

    this.level = opts.level!;
    this.previous_id = opts.previous_id;
    this.transfer_types_id = opts.transfer_types_id;
    this.previous_instrument_types_id = opts.previous_instrument_types_id;
    this.previous_ownership_types_id = opts.previous_ownership_types_id;
    this.instrument_designation = opts.instrument_designation;
    this.setup_transfers_id = opts.setup_transfers_id;
  }
}
