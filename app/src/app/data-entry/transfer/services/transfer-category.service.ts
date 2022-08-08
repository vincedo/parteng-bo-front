import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import { map, Observable } from 'rxjs';

import { RestService } from '@app/core/services';
import { PartengApiService, SerializerService } from '@app/shared/services';
import { HALResource } from '@app/shared/models';
import { TransferCategory, TransferCategoryDto } from '../models';

@Injectable({ providedIn: 'root' })
class TransferCategorySerializerService extends SerializerService<TransferCategory, TransferCategoryDto> {
  fromDto(transferCategoryDto: HALResource<TransferCategoryDto>): TransferCategory {
    return new TransferCategory(transferCategoryDto);
  }

  toDto(entity: TransferCategory): any {
    return {
      ...this.getDtoBaseProps(entity),
      // @TODO
    };
  }
}

@Injectable({ providedIn: 'root' })
export class TransferCategoryService extends PartengApiService<TransferCategory, HALResource<TransferCategoryDto>> {
  constructor(rest: RestService, serializer: TransferCategorySerializerService) {
    super(rest, serializer, '/transfer-categories', 'transfer_categories');
  }

  getAll$(): Observable<TransferCategory[]> {
    return this.getCollection$().pipe(map((transferCategories) => _.sortBy(transferCategories, 'order')));
  }
}
