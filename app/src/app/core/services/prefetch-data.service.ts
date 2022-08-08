import { Injectable } from '@angular/core';

import { forkJoin } from 'rxjs';

import { FundTypeService } from '@app/project/services/fund-type.service';
import { LegalEntityTypeService } from '@app/project/services/legal-entity-type.service';
import { InstrumentTypeService } from '@app/data-entry/services';
import { PersonQualityService } from '@app/data-entry/services';
import { TransferTypeService, OwnershipTypeService, TransferCategoryService } from '@app/data-entry/transfer/services';
import { GoalService } from '@app/project/services/goal.service';
import { WorldService } from '@app/project/services/world.service';
import { ProjectTemplateService2 } from '@app/project/services/project-template2.service';
import { StandardFolderService2 } from '@app/project/services/standard-folder2.service';

@Injectable({ providedIn: 'root' })
export class PrefetchDataService {
  constructor(
    private projectTemplateService: ProjectTemplateService2,
    private standardFolderService: StandardFolderService2,
    private worldService: WorldService,
    private goalService: GoalService,
    private legalEntityTypeService: LegalEntityTypeService,
    private fundTypeService: FundTypeService,
    private transferTypeService: TransferTypeService,
    private transferCategoryService: TransferCategoryService,
    private instrumentTypeService: InstrumentTypeService,
    private personQualityService: PersonQualityService,
    private ownershipTypeService: OwnershipTypeService
  ) {}

  fetch$() {
    return forkJoin({
      // Project Data
      allTemplates: this.projectTemplateService.getAll$(),
      allStandardFolders: this.standardFolderService.getAll$(),
      allWorlds: this.worldService.getAll$(),
      allGoals: this.goalService.getAll$(),
      // Person Data
      allLegalEntityTypes: this.legalEntityTypeService.getAll$(),
      allFundTypes: this.fundTypeService.getAll$(),
      allPersonQualities: this.personQualityService.getAll$(),
      // Transfer & Instrument Data
      allTransferTypes: this.transferTypeService.getAll$(),
      allTransferCategories: this.transferCategoryService.getAll$(),
      allInstrumentTypes: this.instrumentTypeService.getAll$(),
      allOwnershipTypes: this.ownershipTypeService.getAll$(),
    });
  }
}
