import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { RestService } from '@app/core/services';
import { PartengApiService, SerializerService } from '@app/shared/services';
import { HALResource } from '@app/shared/models';
import { LegalEntityType, LegalEntityTypeDto } from '../models/legal-entity-type.model';

@Injectable({ providedIn: 'root' })
class LegalEntityTypeSerializerService extends SerializerService<LegalEntityType, LegalEntityTypeDto> {
  fromDto(json: HALResource<LegalEntityTypeDto>): LegalEntityType {
    return new LegalEntityType(json);
  }

  toDto(entity: LegalEntityType): any {
    return {
      ...this.getDtoBaseProps(entity),
      name: entity.name,
      short_name: entity.short_name,
      order: entity.order,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class LegalEntityTypeService extends PartengApiService<LegalEntityType, HALResource<LegalEntityTypeDto>> {
  constructor(rest: RestService, serializer: LegalEntityTypeSerializerService) {
    super(rest, serializer, '/legal-entity-types', 'legal_entity_types');
  }

  getAll$(): Observable<LegalEntityType[]> {
    return this.getCollection$().pipe(map((entityTypes) => _.sortBy(entityTypes, 'order')));
  }
}
