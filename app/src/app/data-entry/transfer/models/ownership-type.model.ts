import { EntityWithId, EntityWithIdDto } from '@app/shared/models';

export interface OwnershipTypeDto extends EntityWithIdDto {
  name: string;
  short_name: string;
  order: number;
}

export class OwnershipType extends EntityWithId {
  name: string;
  short_name: string;
  order: number;

  constructor(opts: Partial<OwnershipTypeDto> = {}) {
    super(opts);

    this.name = opts.name!;
    this.short_name = opts.short_name!;
    this.order = opts.order!;
  }
}
