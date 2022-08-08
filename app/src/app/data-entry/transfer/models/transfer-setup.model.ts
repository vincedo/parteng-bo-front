/**
 * @file
 * A "transfer setup" is an entity that helps create a transfer
 * by providing info and constraints about the transfer.
 *
 * It can only be obtained after the user has selected all the
 * required instruments in the transfer, which determines the "setup_transfers_id"
 * (i.e. the id of the transfer setup).
 */
import { EntityWithId, EntityWithIdDto } from '@app/shared/models';
import { TransferSetupInstrument } from './transfer-setup-instrument.model';
import { TransferSetupPerson } from './transfer-setup-person.model';

export interface TransferSetupDtoWithRels extends EntityWithIdDto {
  transfer_types_id: number;
  description: string;

  setupInstruments: TransferSetupInstrument[];
  setupPersons: TransferSetupPerson[];
}

export class TransferSetup extends EntityWithId {
  transfer_types_id: number;
  description: string;

  setupInstruments: TransferSetupInstrument[];
  setupPersons: TransferSetupPerson[];

  constructor(opts: Partial<TransferSetupDtoWithRels> = {}) {
    super(opts);

    this.transfer_types_id = opts.transfer_types_id!;
    this.description = opts.description!;

    this.setupInstruments = opts.setupInstruments || [];
    this.setupPersons = opts.setupPersons || [];
  }

  clone(opts: Partial<TransferSetupDtoWithRels> = {}): TransferSetup {
    const clone = new TransferSetup({
      ...this.cloneEntityProps(opts),

      transfer_types_id: opts.transfer_types_id || this.transfer_types_id,
      description: opts.description !== undefined ? opts.description : this.description,

      setupInstruments: opts.setupInstruments || [...this.setupInstruments],
      setupPersons: opts.setupPersons || [...this.setupPersons],
    });
    return clone;
  }
}
