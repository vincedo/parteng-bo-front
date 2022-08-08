import { Injectable } from '@angular/core';
import { RestService } from '@app/core/services';
import { HALResource } from '@app/shared/models';
import { PartengApiService, SerializerService } from '@app/shared/services';
import { Instrument, InstrumentDto } from '../models/instrument.model';

@Injectable({ providedIn: 'root' })
export class InstrumentService extends PartengApiService<Instrument, HALResource<InstrumentDto>> {
  constructor(rest: RestService, serializer: InstrumentSerializerService) {
    super(rest, serializer, '/instruments', 'instruments');
  }
}

@Injectable({ providedIn: 'root' })
export class InstrumentSerializerService extends SerializerService<Instrument, InstrumentDto> {
  fromDto(instrumentDto: HALResource<InstrumentDto>): Instrument {
    return new Instrument(instrumentDto);
  }

  toDto(entity: Instrument): any {
    return {
      ...this.getDtoBaseProps(entity),
      name: entity.name,
      instrument_types_id: entity.instrument_types_id,
      comment: entity.comment,
    };
  }
}
