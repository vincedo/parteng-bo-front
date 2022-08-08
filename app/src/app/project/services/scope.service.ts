import { Injectable } from '@angular/core';

import * as _ from 'lodash';
import { forkJoin, map, mapTo, mergeMap, Observable, of, tap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';

import { HalApiService } from '@app/core/services/hal-api.service';
import { DIALOG_WIDTH_LARGE, DIALOG_WIDTH_SMALL } from '@app/shared/shared.constants';
import { Project, Scope } from '../models';
import { SettingsService } from '@app/data-entry/services/settings.service';
import {
  DialogScopeSelectorData,
  DialogScopeSelectorSharedComponent,
} from '@app/shared/components/dialog-scope-selector-shared/dialog-scope-selector-shared.component';
import { ServicesStore } from '@app/core/store/services.store';
import {
  DialogScopeFormData,
  DialogScopeFormSharedComponent,
} from '@app/shared/components/dialog-scope-form-shared/dialog-scope-form-shared.component';
import { RestService } from '@app/core/services';
import { environment } from 'src/environments/environment';
import { IdToIdRel } from '@app/core/models';
import { PartengHelper } from '@app/core/helpers';

@Injectable({ providedIn: 'root' })
export class ScopeService {
  constructor(
    private halApiService: HalApiService,
    private settingsService: SettingsService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private servicesStore: ServicesStore,
    private restService: RestService
  ) {}

  newScope(): Scope {
    const scope = new Scope();
    // scope.code = '';
    // scope.name = '';
    // scope.historicalName = '';
    // scope.city = '';
    // scope.comment = '';
    scope.status = this.settingsService.get<number>('STATUS_ACTIVE')!;
    return scope;
  }

  getAll$(): Observable<Scope[]> {
    return this.halApiService.getCollection$(Scope, '/scopes', { sets: 'full' }, 'scopes').pipe(
      map((scopes) => this.postProcessScopes(scopes)),
      map((scopes) => _.sortBy(scopes, 'code'))
    );
  }

  // TODO: use a real API call
  getScopesByCode$(code: string): Observable<Scope[]> {
    return this.getAll$().pipe(map((scopes) => scopes.filter((scope) => scope.code === code)));
  }

  getScopeById$(scopeId: number): Observable<Scope> {
    return this.halApiService
      .getOne$<Scope>(Scope, `/scopes/${scopeId}`, { sets: 'full' })
      .pipe(map((scope) => this.postProcessScope(scope)));
  }

  private postProcessScopes(scopes: Scope[]): Scope[] {
    return scopes.map((scope) => this.postProcessScope(scope));
  }

  // Copy the "worlds" data on the root property `scope.worlds`
  private postProcessScope(scope: Scope): Scope {
    scope.worlds = scope.relScopeToWorlds.map((rel) => rel.world);
    return scope;
  }

  saveScope$(scope: Scope): Observable<Scope> {
    const saveScope$ = scope.id
      ? this.halApiService.putOne$<Scope>(`/scopes/${scope.id}`, {}, scope)
      : this.halApiService.postOne$<Scope>('/scopes', {}, scope);

    // Reload the scope right after saving to get the full-blown, deserialized version
    // and also to get the previous version of the scope (so we know what scope.worlds contained)
    const saveScopeAndReload$ = saveScope$.pipe(mergeMap((scope) => this.getScopeById$(scope.id)));

    return saveScopeAndReload$.pipe(
      // NB. `scope.id` will be undefined for new scopes, hence the scope.clone(...)
      mergeMap((savedScope) =>
        this.saveScopeWorlds$(savedScope, scope.clone({ id: savedScope.id })).pipe(mapTo(savedScope.id))
      ),
      // reload the full-blown scope, with scope.worlds populated
      mergeMap((scopeId) => this.getScopeById$(scopeId))
    );
  }

  private saveScopeWorlds$(savedScope: Scope, presaveScope: Scope) {
    const oldRels = this.getScopeToWorldIdToIdRels(savedScope);
    const newRels = this.getScopeToWorldIdToIdRels(presaveScope);
    const relsDiff = PartengHelper.computeIdToIdRelationsDiff(oldRels, newRels);
    const { created, deleted } = relsDiff;

    // NB. No requests for "updated" rels
    const createRels$ =
      created.length > 0 ? forkJoin(created.map((rel) => this.saveRelScopeToWorld$(rel[0], rel[1]))) : of([]);
    const deleteRels$ =
      deleted.length > 0 ? forkJoin(deleted.map((rel) => this.deleteRelScopeToWorld(rel[0], rel[1]))) : of([]);

    return createRels$.pipe(mergeMap(() => deleteRels$));
  }

  //
  // ----- Rel Scope To Worlds -----
  //

  private getScopeToWorldIdToIdRels(scope: Scope): IdToIdRel[] {
    return scope.worlds.map((world) => [scope.id, world.id]);
  }

  // PUT rel_scopes_to_worlds
  private saveRelScopeToWorld$(scopeId: number, worldId: number) {
    const body = { status: this.settingsService.get<number>('STATUS_ACTIVE')! };
    return this.restService.put({ url: `${environment.api.baseURL}/scopes/${scopeId}/worlds/${worldId}`, body });
  }

  // DELETE rel_scopes_to_worlds
  private deleteRelScopeToWorld(scopeId: number, worldId: number) {
    return this.restService.delete({ url: `${environment.api.baseURL}/scopes/${scopeId}/worlds/${worldId}` });
  }

  //
  // ----- Delete Scope -----
  //

  deleteScope$(scope: Scope) {
    return this.halApiService.deleteOne$<Scope>(`/scopes/${scope.id}`);
  }

  //
  // ----- Dialogs -----
  //

  showScopeSelectorDialog(opts: {
    title: string;
    // titleName: string;
    description?: string;
    selectedItemsTitle?: string;
    selectedItemsDescription?: string;
    itemAdditionalInfoTitle?: string;
    selectedScopes?: Scope[];
    hideAddItemButton?: boolean;
  }): Observable<Scope[] | undefined> {
    this.servicesStore.dispatch(this.getAll$(), 'scopes');
    return this.dialog
      .open<DialogScopeSelectorSharedComponent, DialogScopeSelectorData>(DialogScopeSelectorSharedComponent, {
        width: DIALOG_WIDTH_LARGE,
        data: {
          dialogTitle: this.translateService.instant(opts.title), // { name: opts.titleName }
          dialogDescription: this.translateService.instant(
            opts.description || 'project.dialogScopeSelector.description'
          ),
          selectedItemsTitle: this.translateService.instant(
            opts.selectedItemsTitle || 'project.dialogScopeSelector.selectedItemsTitle'
          ),
          selectedItemsDescription: this.translateService.instant(
            opts.selectedItemsDescription || 'project.dialogScopeSelector.selectedItemsDescription'
          ),
          itemAdditionalInfoTitle: this.translateService.instant(
            opts.itemAdditionalInfoTitle || 'project.dialogScopeSelector.itemAdditionalInfoTitle'
          ),
          selectedScopes: opts.selectedScopes || [],
          hideAddItemButton: opts.hideAddItemButton ?? false,
        },
      })
      .afterClosed();
  }

  showScopeDialog({
    mode,
    scope,
    showDeleteButton = false,
    fromReferentialScopes = false,
  }: {
    mode: 'create' | 'view' | 'edit';
    scope?: Scope;
    showDeleteButton?: boolean;
    fromReferentialScopes?: boolean;
  }): Observable<Scope | undefined> {
    return this.dialog
      .open<DialogScopeFormSharedComponent, DialogScopeFormData>(DialogScopeFormSharedComponent, {
        width: DIALOG_WIDTH_SMALL,
        data: {
          mode,
          scope: scope || this.newScope(),
          showDeleteButton,
          fromReferentialScopes,
        },
      })
      .afterClosed();
  }

  //
  // ----- Project2 Scopes -----
  //

  saveProjectScopes$(project: Project, presaveProject: Project) {
    const oldRels = this.getProjectToScopeIdToIdRels(presaveProject);
    const newRels = this.getProjectToScopeIdToIdRels(project);
    const relsDiff = PartengHelper.computeIdToIdRelationsDiff(oldRels, newRels);
    const { created, deleted } = relsDiff;

    // NB. No requests for "updated" rels
    const createRels$ =
      created.length > 0 ? forkJoin(created.map((rel) => this.saveRelProjectToScope$(rel[0], rel[1]))) : of([]);
    const deleteRels$ =
      deleted.length > 0 ? forkJoin(deleted.map((rel) => this.deleteRelProjectToScope$(rel[0], rel[1]))) : of([]);

    return forkJoin([createRels$, deleteRels$]);
  }

  private getProjectToScopeIdToIdRels(project: Project): IdToIdRel[] {
    return project.relProjectToScopes.map((rel) => rel.scope).map((scope) => [project.id, scope.id]);
  }

  // PUT rel_projects_to_scopes
  private saveRelProjectToScope$(projectId: number, scopeId: number) {
    const body = { status: this.settingsService.get<number>('STATUS_ACTIVE')! };
    return this.restService.put({ url: `${environment.api.baseURL}/projects/${projectId}/scopes/${scopeId}`, body });
  }

  deleteProjectScopes$(project: Project) {
    return project.relProjectToScopes.length > 0
      ? forkJoin(
          project.relProjectToScopes.map((relProjectToScope) =>
            this.deleteRelProjectToScope$(project.id, relProjectToScope.scope.id)
          )
        )
      : of([]);
  }

  // DELETE rel_projects_to_scopes
  private deleteRelProjectToScope$(projectId: number, scopeId: number) {
    return this.restService.delete({ url: `${environment.api.baseURL}/projects/${projectId}/scopes/${scopeId}` });
  }
}
