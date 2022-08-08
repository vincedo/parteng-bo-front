import { Injectable } from '@angular/core';
import { QueryParams } from '@app/core/models';
import { RestService } from '@app/core/services';
import { HALResource } from '@app/shared/models';
import { PartengApiService, SerializerService } from '@app/shared/services';
import { forkJoin, map, Observable } from 'rxjs';
import { TransferSetup, TransferSetupDtoWithRels, TransferSetupInstrument, TransferSetupPerson } from '../models';
import { TransferSetupInstrumentService } from './transfer-setup-instrument.service';
import { TransferSetupPersonService } from './transfer-setup-person.service';

@Injectable({ providedIn: 'root' })
class TransferSetupSerializerService extends SerializerService<TransferSetup, TransferSetupDtoWithRels> {
  fromDto(dto: HALResource<TransferSetupDtoWithRels>): TransferSetup {
    return new TransferSetup(dto);
  }

  toDto(entity: TransferSetup): any {
    return {
      ...this.getDtoBaseProps(entity),
      transfer_types_id: entity.transfer_types_id,
      description: entity.description!,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class TransferSetupService extends PartengApiService<TransferSetup, HALResource<TransferSetupDtoWithRels>> {
  constructor(
    rest: RestService,
    serializer: TransferSetupSerializerService,
    private transferSetupInstrumentService: TransferSetupInstrumentService,
    private transferSetupPersonService: TransferSetupPersonService
  ) {
    super(rest, serializer, '/setup-transfers', 'setup_transfers');
  }

  /**
   * @TODO ?sets=full should return setup-transfer-instruments and setup-transfer-persons
   */
  getAll$(): Observable<TransferSetup[]> {
    return forkJoin({
      allTransferSetups: this.getCollection$(),
      allTransferSetupInstruments: this.transferSetupInstrumentService.getAll$(),
      allTransferSetupPersons: this.transferSetupPersonService.getAll$(),
    }).pipe(
      map(({ allTransferSetups, allTransferSetupInstruments, allTransferSetupPersons }) =>
        this.resolveSetupInstrumentsAndPersonsForTransfers(allTransferSetups, {
          allTransferSetupInstruments,
          allTransferSetupPersons,
        })
      )
    );
  }

  private resolveSetupInstrumentsAndPersonsForTransfers(
    transferSetups: TransferSetup[],
    opts: { allTransferSetupInstruments: TransferSetupInstrument[]; allTransferSetupPersons: TransferSetupPerson[] }
  ): TransferSetup[] {
    return transferSetups.map((transferSetup) => this.resolveTransferSetupInstrumentsAndPersons(transferSetup, opts));
  }

  private resolveTransferSetupInstrumentsAndPersons(
    transferSetup: TransferSetup,
    opts: { allTransferSetupInstruments: TransferSetupInstrument[]; allTransferSetupPersons: TransferSetupPerson[] }
  ): TransferSetup {
    return transferSetup.clone({
      setupInstruments: opts.allTransferSetupInstruments.filter(
        (tSetupInstr) => tSetupInstr.setup_transfers_id === transferSetup.id
      ),
      setupPersons: opts.allTransferSetupPersons.filter(
        (tSetupPerson) => tSetupPerson.setup_transfers_id === transferSetup.id
      ),
    });
  }

  override getById$(id: number, opts: { queryParams?: QueryParams } = {}): Observable<TransferSetup> {
    const getTransferSetup$ = super.getById$(id, opts);
    const getTransfSetupInstruments$ = this.transferSetupInstrumentService.getForTransferSetup$(id);
    const getTransfSetupPersons$ = this.transferSetupPersonService.getForTransferSetup$(id);

    return forkJoin({
      transferSetup: getTransferSetup$,
      setupInstruments: getTransfSetupInstruments$,
      setupPersons: getTransfSetupPersons$,
    }).pipe(
      map(({ transferSetup, setupInstruments, setupPersons }) =>
        transferSetup.clone({ setupInstruments, setupPersons })
      )
    );
  }
}
