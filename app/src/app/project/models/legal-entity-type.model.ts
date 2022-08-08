import { EntityWithId, EntityWithIdDto } from '@app/shared/models';

export interface LegalEntityTypeDto extends EntityWithIdDto {
  name: string;
  short_name: string;
  order: number;
}

export class LegalEntityType extends EntityWithId {
  name: string; // required
  short_name: string; // required
  order: number; // required

  constructor(opts: Partial<LegalEntityTypeDto> = {}) {
    super(opts);
    this.name = opts.name!;
    this.short_name = opts.short_name!;
    this.order = opts.order!;
  }
}
