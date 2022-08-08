import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import { map, Observable } from 'rxjs';

import { RestService } from '@app/core/services';
import { PartengApiService, SerializerService } from '@app/shared/services';
import { HALResource } from '@app/shared/models';

import { OwnershipType, OwnershipTypeDto } from '../models/ownership-type.model';

@Injectable({ providedIn: 'root' })
class OwnershipTypeSerializerService extends SerializerService<OwnershipType, OwnershipTypeDto> {
  fromDto(ownershipTypeDto: HALResource<OwnershipTypeDto>): OwnershipType {
    return new OwnershipType(ownershipTypeDto);
  }

  toDto(entity: OwnershipType): any {
    return {
      ...this.getDtoBaseProps(entity),
      name: entity.name,
      short_name: entity.short_name,
      order: entity.order,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class OwnershipTypeService extends PartengApiService<OwnershipType, HALResource<OwnershipTypeDto>> {
  constructor(rest: RestService, serializer: OwnershipTypeSerializerService) {
    super(rest, serializer, '/ownership-types', 'ownership_types');
  }

  getAll$(): Observable<OwnershipType[]> {
    return this.getCollection$().pipe(map((ownershipTypes) => _.sortBy(ownershipTypes, 'order')));
  }
}
