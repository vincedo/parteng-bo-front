import { EntityWithId, EntityWithIdDto } from '@app/shared/models';

export interface TransferCategoryDto extends EntityWithIdDto {
  name: string;
  order: number;
}

export class TransferCategory extends EntityWithId {
  name: string;
  order: number;

  constructor(opts: Partial<TransferCategoryDto> = {}) {
    super(opts);

    this.name = opts.name!;
    this.order = opts.order!;
  }
}
