import { Injectable } from '@angular/core';

import _ from 'lodash';
import { Observable, map, of, mergeMap, forkJoin, switchMap } from 'rxjs';

import { HalApiService } from '@app/core/services/hal-api.service';
import { SettingsService } from '@app/data-entry/services/settings.service';
import { Project } from '../models';
import { FolderService } from './folder.service';
import { ProjectGoalService } from './project-goal.service';
import { ScopeService } from './scope.service';
import { RestService } from '@app/core/services';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  constructor(
    private halApiService: HalApiService,
    private restService: RestService,
    private settingsService: SettingsService,
    private scopeService: ScopeService,
    private projectGoalService: ProjectGoalService,
    private folderService: FolderService
  ) {}

  newProject(): Project {
    const project = new Project();
    project.status = this.settingsService.get<number>('STATUS_ACTIVE')!;
    project.validationStatus = this.settingsService.get<number>('VALIDATION_STATUS_NOT_REVIEWED')!;
    return project;
  }

  isProjectValidated(project: Project): boolean {
    return project.validationStatus === this.settingsService.get<number>('VALIDATION_STATUS_VALIDATED');
  }

  getAll$(): Observable<Project[]> {
    return this.halApiService
      .getCollection$(Project, '/projects', { sets: 'full' }, 'projects')
      .pipe(map((projects) => _.reverse(_.sortBy(projects, ['date_min', 'id']))));
  }

  getById$(projectId: number): Observable<Project> {
    return this.halApiService.getOne$<Project>(Project, `/projects/${projectId}`, { sets: 'full' }).pipe(
      // Re-hydrate project goals completely, if any
      mergeMap((project) =>
        project.relProjectToGoals.length > 0
          ? forkJoin(
              project.relProjectToGoals.map((relProjectToGoal) =>
                this.projectGoalService.enrichProjectGoalWithPersons$(project.id, relProjectToGoal)
              )
            ).pipe(map((relProjectToGoals) => project.updateAllRelProjectToGoals(relProjectToGoals)))
          : of(project)
      )
    );
  }

  private save$(project: Project): Observable<Project> {
    console.log(`SAVING PROJECT...`, project);

    const loadExistingProject$ = project.id ? this.getById$(project.id) : of(this.newProject());
    const saveProject$: Observable<Project> = project.id
      ? this.halApiService.putOne$<Project>(`/projects/${project.id}`, {}, project)
      : this.halApiService.postOne$<Project>('/projects', {}, project);
    const loadThenSave$ = loadExistingProject$.pipe(
      mergeMap((presaveProject) => saveProject$.pipe(map((savedProject) => ({ savedProject, presaveProject }))))
    );

    return loadThenSave$.pipe(
      // tap((savedProject) => console.log(`SAVED PROJECT (RAW)`, savedProject)),
      // inject the id into the project to save, in case it's a new project
      mergeMap(({ savedProject, presaveProject }) => {
        const projectWithId = project.clone({ id: savedProject.id });
        return this.saveProjectRelations$(projectWithId, presaveProject).pipe(
          mergeMap(() => this.getById$(projectWithId.id))
        );
      })
      // tap((loadedProject) => console.log(`SAVED PROJECT (HYDRATED)`, loadedProject))
    );
  }

  private saveProjectRelations$(projectWithId: Project, presaveProject: Project) {
    return forkJoin([
      this.scopeService.saveProjectScopes$(projectWithId, presaveProject),
      this.projectGoalService.saveProjectGoals$(projectWithId, presaveProject),
      this.folderService.saveProjectFolders$(projectWithId, presaveProject),
    ]);
  }

  saveAsDraft$(project: Project): Observable<Project> {
    return this.save$(project.clone({ status: this.settingsService.get<number>('STATUS_DRAFT')! }));
  }

  saveAsActive$(project: Project): Observable<Project> {
    return this.save$(project.clone({ status: this.settingsService.get<number>('STATUS_ACTIVE')! }));
  }

  delete$(project: Project) {
    return this.scopeService.deleteProjectScopes$(project).pipe(
      switchMap(() => this.projectGoalService.deleteProjectGoals$(project)),
      switchMap(() => this.folderService.deleteProjectFolders$(project)),
      switchMap(() => this.deleteById$(project.id))
    );
  }

  private deleteById$(projectId: number) {
    return this.restService.delete({ url: `${environment.api.baseURL}/projects/${projectId}` });
  }
}
