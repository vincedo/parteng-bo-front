import { Injectable } from '@angular/core';

import { forkJoin, Observable } from 'rxjs';

import { RestService } from '@app/core/services';
import { HALResource, HALSerializerService } from '@app/core/services/hal-serializer.service';
import { Instrument2 } from '@app/data-entry/models/instrument.model';
import { InstrumentLightSerializerService } from '@app/data-entry/services';
import { PartengApiService, SerializerService } from '@app/shared/services';
import { HALResource as HALResourceOld } from '@app/shared/models';
import { TransferInstrument, TransferInstrumentDto } from '../models';

@Injectable({ providedIn: 'root' })
export class TransferInstrumentSerializerService extends SerializerService<TransferInstrument, TransferInstrumentDto> {
  constructor(
    private instrumentLightSerializerService: InstrumentLightSerializerService,
    private halSerializerService: HALSerializerService
  ) {
    super();
  }

  fromDto(dto: any): TransferInstrument {
    // throw new Error(`TransferInstrumentSerializerService should not be used (DEPRECATED)`);
    const $instrument =
      dto._embedded && dto._embedded['instrument']
        ? this.halSerializerService.deserialize<Instrument2>(dto._embedded['instrument'] as HALResource, Instrument2)
        : undefined;

    // const $instrument =
    //   dto._embedded && dto._embedded['instrument']
    //     ? this.instrumentLightSerializerService.fromDto(dto._embedded['instrument'] as HALResource<InstrumentLightDto>)
    //     : undefined;

    return new TransferInstrument({ ...dto, $instrument });
  }

  toDto(entity: TransferInstrument): any {
    // throw new Error(`TransferInstrumentSerializerService should not be used (DEPRECATED)`);
    return {
      ...this.getDtoBaseProps(entity),
      id: entity.id,

      instruments_id: entity.instruments_id,
      transfers_id: entity.transfers_id,
      instrument_number: entity.instrument_number,

      input_quantity: entity.input_quantity,
      input_accounting_total_amount: entity.input_accounting_total_amount,
      input_accounting_unit_value: entity.input_accounting_unit_value,
      input_actual_unit_value: entity.input_actual_unit_value,
      input_actual_total_amount: entity.input_actual_total_amount,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class TransferInstrumentService extends PartengApiService<
  TransferInstrument,
  HALResourceOld<TransferInstrumentDto>
> {
  constructor(rest: RestService, serializer: TransferInstrumentSerializerService) {
    super(rest, serializer, '/transfer-instruments', 'transfer_instruments');
  }

  getAll$(): Observable<TransferInstrument[]> {
    return this.getCollection$();
  }

  // NB. Saving with HTTP POST is NOT supported
  save$(transferInstrument: TransferInstrument): Observable<TransferInstrument> {
    return this.putOne$(transferInstrument, transferInstrument.id);
  }

  saveAll$(transferInstruments: TransferInstrument[]): Observable<TransferInstrument[]> {
    return forkJoin(transferInstruments.map((tInstrument) => this.save$(tInstrument)));
  }
}
