import { EntityWithId, EntityWithIdDto } from '@app/shared/models';
import { Person } from '@app/project/models';

export interface TransferPersonDto extends EntityWithIdDto {
  transfers_id: number;
  persons_id: number;
  person_number: number;

  $person: Person;
}

export class TransferPerson extends EntityWithId {
  transfers_id: number;
  persons_id: number;
  person_number: number;

  $person: Person;

  constructor(opts: Partial<TransferPersonDto> = {}) {
    super(opts);
    this.transfers_id = opts.transfers_id!;
    this.persons_id = opts.persons_id!;
    this.person_number = opts.person_number!;
    this.$person = opts.$person!;
  }

  clone(opts: Partial<TransferPersonDto> = {}): TransferPerson {
    const clone = new TransferPerson({
      ...this.cloneEntityProps(opts),

      transfers_id: opts.transfers_id !== undefined ? opts.transfers_id : this.transfers_id, // this value could be reset with a "null"
      persons_id: opts.persons_id || this.persons_id,
      person_number: opts.person_number || this.person_number,

      $person: opts.$person || this.$person,
    });

    return clone;
  }
}
