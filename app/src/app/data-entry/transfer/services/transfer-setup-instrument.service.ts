import { Injectable } from '@angular/core';

import _ from 'lodash';
import { map, Observable } from 'rxjs';

import { RestService } from '@app/core/services';
import { PartengApiService, SerializerService } from '@app/shared/services';
import { HALResource } from '@app/shared/models';
import { TransferSetupInstrument, TransferSetupInstrumentDto } from '../models';

@Injectable({ providedIn: 'root' })
class TransferSetupInstrumentSerializerService extends SerializerService<
  TransferSetupInstrument,
  TransferSetupInstrumentDto
> {
  fromDto(dto: HALResource<TransferSetupInstrumentDto>): TransferSetupInstrument {
    return new TransferSetupInstrument(dto);
  }

  toDto(entity: TransferSetupInstrument): any {
    return {
      ...this.getDtoBaseProps(entity),
      // @TODO: INCOMPLETE...
    };
  }
}

@Injectable({ providedIn: 'root' })
export class TransferSetupInstrumentService extends PartengApiService<
  TransferSetupInstrument,
  HALResource<TransferSetupInstrumentDto>
> {
  constructor(rest: RestService, serializer: TransferSetupInstrumentSerializerService) {
    super(rest, serializer, '/setup-transfer-instruments', 'setup_transfer_instruments');
  }

  getAll$(): Observable<TransferSetupInstrument[]> {
    return this.getCollection$();
  }

  // @TODO: Ask backend to add filter {{apiUrl}}/setup-transfer-instruments?setup_transfers_id=393
  getForTransferSetup$(transferSetupId: number): Observable<TransferSetupInstrument[]> {
    return this.getAll$().pipe(
      map((setupInstruments) => setupInstruments.filter((sti) => sti.setup_transfers_id === transferSetupId)),
      map((setupInstruments) => _.sortBy(setupInstruments, 'instrument_number'))
    );
  }
}
