import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import { map, Observable } from 'rxjs';

import { RestService } from '@app/core/services';
import { PartengApiService, SerializerService } from '@app/shared/services';
import { HALResource } from '@app/shared/models';

import { InstrumentLight, InstrumentLightDto } from '../models/instrument-light.model';

@Injectable({ providedIn: 'root' })
export class InstrumentLightSerializerService extends SerializerService<InstrumentLight, InstrumentLightDto> {
  fromDto(InstrumentLightDto: HALResource<InstrumentLightDto>): InstrumentLight {
    return new InstrumentLight(InstrumentLightDto);
  }

  toDto(entity: InstrumentLight): any {
    return {
      ...this.getDtoBaseProps(entity),
      // @todo
    };
  }
}

@Injectable({ providedIn: 'root' })
export class InstrumentLightService extends PartengApiService<InstrumentLight, HALResource<InstrumentLightDto>> {
  constructor(rest: RestService, serializer: InstrumentLightSerializerService) {
    super(rest, serializer, '/instruments', 'instruments');
  }

  getAll$(): Observable<InstrumentLight[]> {
    return this.getCollection$({ queryParams: { sets: 'full' } });
  }

  getForTypes$(instrumentTypes: number[]): Observable<InstrumentLight[]> {
    return this.getCollection$().pipe(
      map((instruments) => instruments.filter((instr) => instrumentTypes.includes(instr.instrument_types_id)))
    );
  }
}
