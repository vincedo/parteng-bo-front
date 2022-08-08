import { EntityWithId, EntityWithIdDto } from '@app/shared/models';

export interface PersonQualityDto extends EntityWithIdDto {
  name: string;
  order: number;
}

export class PersonQuality extends EntityWithId {
  name: string;
  order: number;

  constructor(opts: Partial<PersonQualityDto> = {}) {
    super(opts);

    this.name = opts.name!;
    this.order = opts.order!;
  }
}
