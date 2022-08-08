import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RestService } from '@app/core/services';
import { PartengApiService, SerializerService } from '@app/shared/services';
import { HALResource } from '@app/shared/models';
import { FundType, FundTypeDto } from '../models/fund-type.model';

@Injectable({ providedIn: 'root' })
class FundTypeSerializerService extends SerializerService<FundType, FundTypeDto> {
  fromDto(json: HALResource<FundTypeDto>): FundType {
    return new FundType(json);
  }

  toDto(entity: FundType): any {
    return {
      ...this.getDtoBaseProps(entity),
      name: entity.name,
      short_name: entity.short_name,
      order: entity.order,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class FundTypeService extends PartengApiService<FundType, HALResource<FundTypeDto>> {
  constructor(rest: RestService, serializer: FundTypeSerializerService) {
    super(rest, serializer, '/fund-types', 'fund_types');
  }

  getAll$(): Observable<FundType[]> {
    return this.getCollection$().pipe(map((fundTypes) => _.sortBy(fundTypes, 'order')));
  }
}
