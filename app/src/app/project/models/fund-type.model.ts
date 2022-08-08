import { EntityWithId, EntityWithIdDto } from '@app/shared/models';

export interface FundTypeDto extends EntityWithIdDto {
  name: string;
  short_name: string;
  order: number;
}

export class FundType extends EntityWithId {
  name: string; // required
  short_name: string; // required
  order: number; // required

  constructor(opts: Partial<FundTypeDto> = {}) {
    super(opts);
    this.name = opts.name!;
    this.short_name = opts.short_name!;
    this.order = opts.order!;
  }
}
