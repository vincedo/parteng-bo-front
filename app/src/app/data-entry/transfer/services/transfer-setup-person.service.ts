import { Injectable } from '@angular/core';

import _ from 'lodash';
import { map, Observable } from 'rxjs';

import { RestService } from '@app/core/services';
import { PartengApiService, SerializerService } from '@app/shared/services';
import { HALResource } from '@app/shared/models';
import { TransferSetupPerson, TransferSetupPersonDto } from '../models';

@Injectable({ providedIn: 'root' })
class TransferSetupPersonSerializerService extends SerializerService<TransferSetupPerson, TransferSetupPersonDto> {
  fromDto(dto: HALResource<TransferSetupPersonDto>): TransferSetupPerson {
    return new TransferSetupPerson(dto);
  }

  toDto(entity: TransferSetupPerson): any {
    return {
      ...this.getDtoBaseProps(entity),
      // @TODO: INCOMPLETE...
    };
  }
}

@Injectable({ providedIn: 'root' })
export class TransferSetupPersonService extends PartengApiService<
  TransferSetupPerson,
  HALResource<TransferSetupPersonDto>
> {
  constructor(rest: RestService, serializer: TransferSetupPersonSerializerService) {
    super(rest, serializer, '/setup-transfer-persons', 'setup_transfer_persons');
  }

  getAll$(): Observable<TransferSetupPerson[]> {
    return this.getCollection$();
  }

  // @TODO: Ask backend to add filter {{apiUrl}}/setup-transfer-persons?setup_transfers_id=393
  getForTransferSetup$(transferSetupId: number): Observable<TransferSetupPerson[]> {
    return this.getAll$().pipe(
      map((setupPersons) => setupPersons.filter((stp) => stp.setup_transfers_id === transferSetupId)),
      map((setupPersons) => _.sortBy(setupPersons, 'person_number'))
    );
  }
}
