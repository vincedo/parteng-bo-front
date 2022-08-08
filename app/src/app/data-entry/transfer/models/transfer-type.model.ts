import { EntityWithId, EntityWithIdDto } from '@app/shared/models';

export interface TransferTypeDto extends EntityWithIdDto {
  name: string;
  short_name: string;
  order: number;
  transfer_categories_id: number;
  comment: string;
}

export class TransferType extends EntityWithId {
  name: string;
  short_name: string;
  order: number;
  transfer_categories_id: number;
  comment: string | undefined;

  constructor(opts: Partial<TransferTypeDto> = {}) {
    super(opts);

    this.name = opts.name!;
    this.short_name = opts.short_name!;
    this.order = opts.order!;
    this.transfer_categories_id = opts.transfer_categories_id!;
    this.comment = opts.comment;
  }
}
