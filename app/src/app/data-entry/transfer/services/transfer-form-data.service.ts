import { Injectable } from '@angular/core';

import { forkJoin, map, of } from 'rxjs';

import { ConfigService } from '@app/core/services';
import { ProjectAndFolderLightService } from '@app/project/services/project-and-folder-light.service';
import { PersonService } from '@app/project/services/person.service';
import { InstrumentLightService } from '@app/data-entry/services';
import { Transfer } from '../models/transfer.model';
import { TransferService } from './transfer.service';
import { TransferSetupInputStepService } from './transfer-setup-input-step.service';

@Injectable({ providedIn: 'root' })
export class TransferFormDataService {
  constructor(
    private config: ConfigService,
    private projectAndFolderLightService: ProjectAndFolderLightService,
    private transferService: TransferService,
    private instrumentLightService: InstrumentLightService,
    private setupTransferInputStepService: TransferSetupInputStepService,
    private personService: PersonService
  ) {}

  getData$(opts: { projectId: number; folderId: number; transferId?: number; transferIdToCopy?: number }) {
    const createDuplicate = !opts.transferId && !!opts.transferIdToCopy;
    const transferId = opts.transferId || opts.transferIdToCopy;
    return forkJoin({
      transfer: transferId
        ? this.transferService.getById$(transferId, { projectId: opts.projectId, createDuplicate })
        : this.projectAndFolderLightService
            .getProjectAndFolder$(opts)
            .pipe(
              map(
                ({ project, folder }) =>
                  new Transfer({ parentProject: project, parentFolder: folder!, folders_id: folder!.id })
              )
            ),
      transferTypes: of(this.config.getAllTransferTypes()),
      instruments: this.instrumentLightService.getAll$(),
      instrumentTypes: of(this.config.getAllInstrumentTypes()),
      personQualities: of(this.config.getAllPersonQualities()),
      ownershipTypes: of(this.config.getAllOwnershipTypes()),
      setupTransferInputSteps: this.setupTransferInputStepService.getAll$(),
      persons: this.personService.getAll$(),
    });
  }
}
