import { Injectable } from '@angular/core';

import { forkJoin, Observable, of } from 'rxjs';

import { Goal, Person, LegalEntityType, FundType, ProjectTemplate2, StandardFolder2, Project, World } from '../models';
import { PersonService } from './person.service';
import { ConfigService } from '@app/core/services';
import { ProjectTemplateService2 } from './project-template2.service';
import { StandardFolderService2 } from './standard-folder2.service';
import { ProjectService } from './project.service';
import { GoalService } from './goal.service';

export interface ProjectFormData {
  project?: Project;
  allTemplates: ProjectTemplate2[];
  // allScopes: Scope2[];
  allWorlds: World[];
  allGoals: Goal[];
  allPersons: Person[];
  allLegalEntityTypes: LegalEntityType[];
  allFundTypes: FundType[];
  allStandardFolders: StandardFolder2[];
}

@Injectable({ providedIn: 'root' })
export class ProjectFormDataService {
  constructor(
    private projectService: ProjectService,
    // private scopeService: ScopeService2,
    private goalService: GoalService,
    private personService: PersonService,
    private projectTemplateService: ProjectTemplateService2,
    private standardFolderService: StandardFolderService2,
    private config: ConfigService
  ) {}

  getData$(projectId?: number): Observable<ProjectFormData> {
    return forkJoin({
      project: projectId ? this.projectService.getById$(projectId) : of(undefined),
      allTemplates: this.projectTemplateService.getAll$(),
      allStandardFolders: this.standardFolderService.getAll$(),
      // allScopes: this.scopeService.getAll$(),
      allWorlds: of(this.config.getAllWorlds()),
      allGoals: this.goalService.getAll$(),
      allPersons: this.personService.getAll$(),
      allLegalEntityTypes: of(this.config.getAllLegalEntityTypes()),
      allFundTypes: of(this.config.getAllFundTypes()),
    });
  }
}
