import { Injectable } from '@angular/core';

import { forkJoin, map, mapTo, mergeMap, Observable, of, share, switchMap, tap } from 'rxjs';

import { QueryParams } from '@app/core/models';
import { ConfigService, RestService } from '@app/core/services';
import { HALResource } from '@app/shared/models';
import { PartengApiService, SerializerService } from '@app/shared/services';
import {
  FolderLight,
  ProjectAndFolderLightService,
  ProjectLight,
} from '../../../project/services/project-and-folder-light.service';
import {
  Transfer,
  TransferCategory,
  TransferDto,
  TransferInstrument,
  TransferInstrumentDto,
  TransferPerson,
  TransferPersonDto,
  TransferSetup,
} from '../models';
import { TransferInstrumentSerializerService, TransferInstrumentService } from './transfer-instrument.service';
import { TransferPersonSerializerService, TransferPersonService } from './transfer-person.service';
import { TransferSetupService } from './transfer-setup.service';
import { FolderService } from '@app/project/services/folder.service';

@Injectable({ providedIn: 'root' })
class TransferSerializerService extends SerializerService<Transfer, TransferDto> {
  constructor(
    private transferInstrumentSerializer: TransferInstrumentSerializerService,
    private transferPersonSerializerService: TransferPersonSerializerService
  ) {
    super();
  }

  fromDto(transferDto: HALResource<TransferDto>): Transfer {
    return new Transfer({
      ...transferDto,
      transferInstruments: this.extractTransferInstruments(transferDto),
      transferPersons: this.extractTransferPersons(transferDto),
    });
  }

  private extractTransferInstruments(transferDto: HALResource<TransferDto>): TransferInstrument[] {
    const transferInstrumentDtos: HALResource<TransferInstrumentDto>[] =
      transferDto._embedded &&
      transferDto._embedded['transfer_instruments'] &&
      Array.isArray(transferDto._embedded['transfer_instruments'])
        ? transferDto._embedded['transfer_instruments']
        : [];
    return transferInstrumentDtos.map((transferInstrumentDto) =>
      this.transferInstrumentSerializer.fromDto(transferInstrumentDto)
    );
  }

  private extractTransferPersons(transferDto: HALResource<TransferDto>): TransferPerson[] {
    const transferPersonDtos: HALResource<TransferPersonDto>[] =
      transferDto._embedded &&
      transferDto._embedded['transfer_persons'] &&
      Array.isArray(transferDto._embedded['transfer_persons'])
        ? transferDto._embedded['transfer_persons']
        : [];
    return transferPersonDtos.map((transferPersonDto) =>
      this.transferPersonSerializerService.fromDto(transferPersonDto)
    );
  }

  toDto(entity: Transfer): HALResource<any> {
    return {
      ...this.getDtoBaseProps(entity),
      folders_id: entity.folders_id,
      setup_transfers_id: entity.setup_transfers_id,
      data_source: entity.data_source,
      date: entity.date,
      validation_status: entity.validation_status,
      comment: entity.comment!,
      _embedded: {
        transfer_instruments: entity.transferInstruments.map((transfInstrument) =>
          this.transferInstrumentSerializer.toDto(transfInstrument)
        ),
        transfer_persons: entity.transferPersons.map((transfPerson) =>
          this.transferPersonSerializerService.toDto(transfPerson)
        ),
      },
    };
  }
}

@Injectable({ providedIn: 'root' })
export class TransferService extends PartengApiService<Transfer, HALResource<TransferDto>> {
  private _transferSetups!: TransferSetup[];

  constructor(
    rest: RestService,
    serializer: TransferSerializerService,
    private projectAndFolderLightService: ProjectAndFolderLightService,
    private transferSetupService: TransferSetupService,
    private transferInstrumentService: TransferInstrumentService,
    private transferPersonService: TransferPersonService,
    private folderService: FolderService,
    private config: ConfigService
  ) {
    super(rest, serializer, '/transfers', 'transfers');
  }

  getAll$(opts: { queryParams?: QueryParams } = {}): Observable<Transfer[]> {
    return this.getCollection$({ queryParams: { sets: 'full', ...opts.queryParams } });
  }

  /**
   * Load all transfers for the given project, and optionally for the given folder.
   */
  getAllForProject$(opts: { projectId: number; folderId?: number }): Observable<{
    allTransfers: Transfer[];
    allTransferCategories: TransferCategory[];
    project: ProjectLight;
    folder?: FolderLight;
  }> {
    const getProjectAndFolder$ = this.projectAndFolderLightService.getProjectAndFolder$(opts).pipe(share());

    const getTransfersQueryParams: QueryParams = opts.folderId
      ? { folders_id: `${opts.folderId}` }
      : { projects_id: `${opts.projectId}` };

    return forkJoin({
      project: getProjectAndFolder$.pipe(map(({ project }) => project)),
      folder: getProjectAndFolder$.pipe(map(({ folder }) => folder)),
      allTransfers: this.getAll$({ queryParams: getTransfersQueryParams }),
      allTransferSetups: this.getAllTransferSetups$(),
      allTransferCategories: of(this.config.getAllTransferCategories()),
    }).pipe(
      // Get folder(s) for the current transfers
      // If a folderId was given, then we have only one folder
      // If no folderId was given, then we need to fetch the folders for the current transfers
      mergeMap((allData) =>
        (allData.folder ? of([allData.folder]) : this.getTransfersFolderLights$(allData.allTransfers)).pipe(
          map((folderLights) => ({ ...allData, folderLights }))
        )
      ),
      map(({ project, folder, allTransfers, allTransferSetups, allTransferCategories, folderLights }) => ({
        project,
        folder,
        allTransfers: this.resolveMiscTransferProperties({
          transfers: allTransfers,
          allTransferSetups,
          project,
          folderLights,
        }),
        allTransferCategories,
      }))
    );
  }

  override getById$(
    id: number,
    opts: { projectId: number; createDuplicate?: boolean; queryParams?: QueryParams }
  ): Observable<Transfer> {
    const createDuplicate = opts.createDuplicate ?? false;

    return super.getById$(id, opts).pipe(
      mergeMap((transfer) => {
        const getTransferSetupAndType$ = this.transferSetupService.getById$(transfer.setup_transfers_id).pipe(
          map((transferSetup) => {
            const transferTypes = this.config.getAllTransferTypes();
            const transferType = transferTypes.find(
              (transferType) => transferType.id === transferSetup.transfer_types_id
            );
            return { transferSetup, transferType };
          })
        );

        return forkJoin({
          projectAndFolderLight: this.projectAndFolderLightService.getProjectAndFolder$({
            projectId: opts.projectId,
            folderId: transfer.folders_id,
          }),
          transferSetupAndType: getTransferSetupAndType$,
        }).pipe(
          map(({ projectAndFolderLight, transferSetupAndType }) =>
            transfer.clone({
              parentProject: projectAndFolderLight.project,
              parentFolder: projectAndFolderLight.folder,
              transferSetup: transferSetupAndType.transferSetup,
              transferType: transferSetupAndType.transferType,
            })
          ),
          map((transfer) => this.resolveTransferInstrumentsOwnershipTypes(transfer)),
          map((transfer) => (createDuplicate ? transfer.cloneAsNew() : transfer))
        );
      })
    );
  }

  /**
   * Compute some `transfer` properties on the frontend.
   */
  private resolveMiscTransferProperties(opts: {
    transfers: Transfer[];
    allTransferSetups: TransferSetup[];
    project: ProjectLight;
    folderLights: FolderLight[];
  }): Transfer[] {
    let updatedTransfers = this.resolveTransferTypeForTransfers(opts.transfers, opts.allTransferSetups);
    updatedTransfers = this.resolveParentProjectForTransfers(updatedTransfers, opts.project);
    updatedTransfers = this.resolveParentFoldersForTransfers(updatedTransfers, opts.folderLights);
    return updatedTransfers;
  }

  private resolveTransferTypeForTransfers(transfers: Transfer[], allTransferSetups: TransferSetup[]): Transfer[] {
    return transfers.map((transfer) => this.resolveTransferTypeViaTransferSetup(transfer, allTransferSetups));
  }

  // Determine the given transfer's type by using transfer.setup_transfers_id
  private resolveTransferTypeViaTransferSetup(transfer: Transfer, allTransferSetups: TransferSetup[]): Transfer {
    const transferSetup = allTransferSetups.find((transferSetup) => transferSetup.id === transfer.setup_transfers_id)!;
    const transferType = this.config
      .getAllTransferTypes()
      .find((transferType) => transferType.id === transferSetup.transfer_types_id)!;
    return transfer.clone({ transferSetup, transferType });
  }

  private resolveParentProjectForTransfers(transfers: Transfer[], project: ProjectLight): Transfer[] {
    return transfers.map((transfer) => transfer.clone({ parentProject: project }));
  }

  private resolveParentFoldersForTransfers(transfers: Transfer[], folderLights: FolderLight[]): Transfer[] {
    return transfers.map((transfer) =>
      transfer.clone({ parentFolder: folderLights.find((fl) => fl.id === transfer.folders_id) })
    );
  }

  private resolveTransferInstrumentsOwnershipTypes(transfer: Transfer): Transfer {
    const ownershipTypes = this.config.getAllOwnershipTypes();
    for (const transfInstrument of transfer.transferInstruments) {
      // find the setup instr info for the current transfer instrument
      const setupInstr = transfer.transferSetup.setupInstruments.find(
        (setupInstr) => (setupInstr.instrument_number = transfInstrument.instrument_number)
      )!;
      const $ownershipType = ownershipTypes.find((ownshipType) => ownshipType.id === setupInstr.ownership_types_id);
      transfer = transfer.updateTransfInstrument(transfInstrument.instrument_number - 1, { $ownershipType });
    }
    return transfer;
  }

  /**
   * Return the list of folders (FolderLight) for the given list of transfers.
   */
  private getTransfersFolderLights$(transfers: Transfer[]): Observable<FolderLight[]> {
    const folderIds = transfers.map((t) => t.folders_id);
    return this.folderService.getFoldersByIds$(folderIds).pipe(
      map((folders) =>
        folders.map((folder) => ({
          id: folder.id,
          name: folder.name,
          long_name: folder.longName,
          validation_status: folder.validationStatus,
        }))
      )
    );
  }

  /**
   * Return the list of all transfer setups, either from the cache if it's set,
   * or from the backend if the cache isn't set.
   */
  private getAllTransferSetups$(): Observable<TransferSetup[]> {
    return of(this._transferSetups).pipe(
      mergeMap((transferSetups) => (transferSetups ? of(transferSetups) : this.transferSetupService.getAll$())),
      tap((transferSetups) => (this._transferSetups = transferSetups))
    );
  }

  save$(transfer: Transfer): Observable<Transfer> {
    // console.log(`SAVING...`, transfer);

    const saveTransfer$ = transfer.id ? this.update$(transfer) : this.postOne$(transfer);

    return saveTransfer$.pipe(
      tap((savedTransfer) => console.log(`SAVED TRANSFER (RAW)`, savedTransfer)),
      // Copy parent project and folder onto the saved transfer (to avoid reloading it completely)
      // (these info are used to build the redirection URL after save)
      map((savedTransfer) =>
        savedTransfer.clone({ parentProject: transfer.parentProject, parentFolder: transfer.parentFolder })
      )
      // tap((savedTransfer) => console.log(`SAVED TRANSFER (ENRICHED)`, savedTransfer))
    );
  }

  /**
   * Update an existing transfer.
   *
   * Why a dedicated method?
   * Because sending JSON with "_embedded" related entities is only supported for HTTP POST.
   */
  update$(transfer: Transfer): Observable<Transfer> {
    const saveTransfer$ = this.putOne$(transfer, transfer.id);
    const saveTransferInstruments$ = this.transferInstrumentService.saveAll$(transfer.transferInstruments);
    const saveTransferPersons$ = this.transferPersonService.saveAll$(transfer.transferPersons);

    return forkJoin([saveTransfer$, saveTransferPersons$, saveTransferInstruments$]).pipe(
      switchMap(() => this.getById$(transfer.id, { projectId: transfer.parentProject.id }))
    );
  }

  delete$(transfer: Transfer): Observable<Transfer> {
    return this.deleteById$(transfer.id).pipe(mapTo(transfer));
  }
}
