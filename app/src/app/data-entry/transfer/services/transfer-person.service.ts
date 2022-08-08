import { Injectable } from '@angular/core';
import { RestService } from '@app/core/services';
import { PersonDto } from '@app/project/models';
import { PersonSerializerService } from '@app/project/services/person.service';
import { HALResource } from '@app/shared/models';
import { PartengApiService, SerializerService } from '@app/shared/services';
import { forkJoin, Observable } from 'rxjs';
import { TransferPerson, TransferPersonDto } from '../models';

@Injectable({ providedIn: 'root' })
export class TransferPersonSerializerService extends SerializerService<TransferPerson, TransferPersonDto> {
  constructor(private personSerializerService: PersonSerializerService) {
    super();
  }

  fromDto(dto: HALResource<TransferPersonDto>): TransferPerson {
    const $person =
      dto._embedded && dto._embedded['person']
        ? this.personSerializerService.fromDto(dto._embedded['person'] as HALResource<PersonDto>)
        : undefined;

    return new TransferPerson({ ...dto, $person });
  }

  toDto(entity: TransferPerson): any {
    return {
      ...this.getDtoBaseProps(entity),
      id: entity.id,

      transfers_id: entity.transfers_id,
      persons_id: entity.persons_id,
      person_number: entity.person_number,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class TransferPersonService extends PartengApiService<TransferPerson, HALResource<TransferPersonDto>> {
  constructor(rest: RestService, serializer: TransferPersonSerializerService) {
    super(rest, serializer, '/transfer-persons', 'transfer_persons');
  }

  getAll$(): Observable<TransferPerson[]> {
    return this.getCollection$();
  }

  // NB. Saving with HTTP POST is NOT supported
  save$(transferPerson: TransferPerson): Observable<TransferPerson> {
    return this.putOne$(transferPerson, transferPerson.id);
  }

  saveAll$(transferPersons: TransferPerson[]): Observable<TransferPerson[]> {
    return forkJoin(transferPersons.map((tPerson) => this.save$(tPerson)));
  }
}
