import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import { map, Observable } from 'rxjs';

import { RestService } from '@app/core/services';
import { PartengApiService, SerializerService } from '@app/shared/services';
import { HALResource } from '@app/shared/models';

import { PersonQuality, PersonQualityDto } from '../models/person-quality.model';

@Injectable({ providedIn: 'root' })
class PersonQualitySerializerService extends SerializerService<PersonQuality, PersonQualityDto> {
  fromDto(personQualityDto: HALResource<PersonQualityDto>): PersonQuality {
    return new PersonQuality(personQualityDto);
  }

  toDto(entity: PersonQuality): any {
    return {
      ...this.getDtoBaseProps(entity),
      name: entity.name,
      order: entity.order,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class PersonQualityService extends PartengApiService<PersonQuality, HALResource<PersonQualityDto>> {
  constructor(rest: RestService, serializer: PersonQualitySerializerService) {
    super(rest, serializer, '/person-qualities', 'person_qualities');
  }

  getAll$(): Observable<PersonQuality[]> {
    return this.getCollection$().pipe(map((personQualities) => _.sortBy(personQualities, 'order')));
  }
}
