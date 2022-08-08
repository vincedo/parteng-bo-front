import { EntityWithId, EntityWithIdDto } from '@app/shared/models';

export interface TransferSetupPersonDto extends EntityWithIdDto {
  setup_transfers_id: number;
  person_number: number;
  person_qualities_id: number;
}

export class TransferSetupPerson extends EntityWithId {
  setup_transfers_id: number;
  person_number: number;
  person_qualities_id: number;

  constructor(opts: Partial<TransferSetupPersonDto> = {}) {
    super(opts);
    this.setup_transfers_id = opts.setup_transfers_id!;
    this.person_number = opts.person_number!;
    this.person_qualities_id = opts.person_qualities_id!;
  }
}
