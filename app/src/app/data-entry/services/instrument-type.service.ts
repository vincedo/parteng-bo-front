import { Injectable } from '@angular/core';
import { RestService } from '@app/core/services';
import { HalApiService } from '@app/core/services/hal-api.service';
import { HALResource } from '@app/shared/models';
import { PartengApiService, SerializerService } from '@app/shared/services';
import * as _ from 'lodash';
import { map, Observable } from 'rxjs';
import { InstrumentType, InstrumentTypeDto } from '../models/instrument-type.model';

@Injectable({ providedIn: 'root' })
export class InstrumentTypeService2 {
  constructor(private halApiService: HalApiService) {}

  getAll$(): Observable<InstrumentType[]> {
    return this.halApiService
      .getCollection$(InstrumentType, '/instrument-types', {}, 'instrument_types')
      .pipe(map((instrumentTypes) => _.sortBy(instrumentTypes, 'order')));
  }
}

@Injectable({ providedIn: 'root' })
export class InstrumentTypeSerializerService extends SerializerService<InstrumentType, InstrumentTypeDto> {
  fromDto(instrumentTypeDto: HALResource<InstrumentTypeDto>): InstrumentType {
    return new InstrumentType(instrumentTypeDto);
  }

  toDto(entity: InstrumentType): any {
    return {
      ...this.getDtoBaseProps(entity),
      name: entity.name,
      short_name: entity.short_name,
      naming_rule: entity.naming_rule,
      order: entity.order,
      included_in_cap_table: entity.included_in_cap_table,
      has_warrant: entity.has_warrant,
      comment: entity.comment!,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class InstrumentTypeService extends PartengApiService<InstrumentType, HALResource<InstrumentTypeDto>> {
  constructor(rest: RestService, serializer: InstrumentTypeSerializerService) {
    super(rest, serializer, '/instrument-types', 'instrument_types');
  }

  getAll$(): Observable<InstrumentType[]> {
    return this.getCollection$().pipe(map((instrumentTypes) => _.sortBy(instrumentTypes, 'order')));
  }
}
