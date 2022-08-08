import { Injectable } from '@angular/core';
import { RestService } from '@app/core/services';
import { HALResource } from '@app/shared/models';
import { PartengApiService, SerializerService } from '@app/shared/services';
import * as _ from 'lodash';
import { map, Observable } from 'rxjs';
import { TransferType, TransferTypeDto } from '../models';

@Injectable({ providedIn: 'root' })
class TransferTypeSerializerService extends SerializerService<TransferType, TransferTypeDto> {
  fromDto(transferTypeDto: HALResource<TransferTypeDto>): TransferType {
    return new TransferType(transferTypeDto);
  }

  toDto(entity: TransferType): any {
    return {
      ...this.getDtoBaseProps(entity),
      name: entity.name,
      short_name: entity.short_name,
      order: entity.order,
      transfer_categories_id: entity.transfer_categories_id,
      comment: entity.comment!,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class TransferTypeService extends PartengApiService<TransferType, HALResource<TransferTypeDto>> {
  constructor(rest: RestService, serializer: TransferTypeSerializerService) {
    super(rest, serializer, '/transfer-types', 'transfer_types');
  }

  getAll$(): Observable<TransferType[]> {
    return this.getCollection$().pipe(map((transferTypes) => _.sortBy(transferTypes, 'order')));
  }
}
