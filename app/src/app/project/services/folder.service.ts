import { Injectable } from '@angular/core';
import { PartengHelper } from '@app/core/helpers';
import { IdToIdRel } from '@app/core/models';
import { RestService } from '@app/core/services';
import { HalApiService } from '@app/core/services/hal-api.service';
import { SettingsService } from '@app/data-entry/services/settings.service';

import { forkJoin, mapTo, mergeMap, Observable, of } from 'rxjs';
import { environment } from 'src/environments/environment';

import { Folder, Project, Scope } from '../models';
import { scopesToRelFolderToScopes } from '../models/rel-folder-to-scope';

@Injectable({ providedIn: 'root' })
export class FolderService {
  constructor(
    private halApiService: HalApiService,
    private settingsService: SettingsService,
    private restService: RestService
  ) {}

  newFolder(opts: { scopes: Scope[] }): Folder {
    const folder = new Folder();
    folder.relFolderToScopes = scopesToRelFolderToScopes(opts.scopes, folder.id);
    folder.status = this.settingsService.get<number>('STATUS_ACTIVE')!;
    return folder;
  }

  getById$(folderId: number): Observable<Folder> {
    return this.halApiService.getOne$<Folder>(Folder, `/folders/${folderId}`, { sets: 'full' });
  }

  /**
   * Return the full folders (with their associated scopes) for the given ids.
   *
   * This method is required because the embedded folders returned
   * by GET /projects/ID?sets=full don't have their associated scopes.
   *
   * Note. Unfortunately, getting a collection of project folders is not supported,
   * i.e. /folders?projects_id=178&sets=full. We must get the folders one by one.
   */
  getFoldersByIds$(folderIds: number[]): Observable<Folder[]> {
    return folderIds.length > 0 ? forkJoin(folderIds.map((folderId) => this.getById$(folderId))) : of([]);
  }

  //
  // ----- SAVE
  //

  /**
   * Why folder.clone({ projectId: project.id })?
   * When folders are added automatically to a new project via a project template,
   * the folder.projectId is not yet set, so we must set it here.
   */
  saveProjectFolders$(project: Project, presaveProject: Project) {
    const deleteRemovedProjectFolders$ = this.deleteRemovedProjectFolders$(project, presaveProject);

    const saveProjectFolders$ =
      project.folders.length > 0
        ? forkJoin(
            project.folders.map((folder) =>
              this.saveProjectFolder$(folder.clone({ projectId: project.id }), presaveProject.folders)
            )
          )
        : of([]);

    return deleteRemovedProjectFolders$.pipe(mergeMap(() => saveProjectFolders$));
  }

  // A folder contains the project id under `folder.projects_id`
  private saveProjectFolder$(folder: Folder, presaveFolders: Folder[]): Observable<Folder> {
    // const saveFolder$ = folder.id ? this.putOne$(folder, folder.id) : this.postOne$(folder);
    const saveFolder$: Observable<Folder> = folder.id
      ? this.halApiService.putOne$<Folder>(`/folders/${folder.id}`, {}, folder)
      : this.halApiService.postOne$<Folder>('/folders', {}, folder);

    const getPresaveFolder = (id: number) => presaveFolders.find((folder) => folder.id === id);

    return saveFolder$.pipe(
      mergeMap((savedFolder) =>
        this.saveRelFolderToScopes$(folder.clone({ id: savedFolder.id }), getPresaveFolder(savedFolder.id)).pipe(
          mapTo(savedFolder)
        )
      )
    );
  }

  private saveRelFolderToScopes$(folder: Folder, presaveFolder?: Folder) {
    const oldRels = presaveFolder ? this.getFolderToScopeIdToIdRels(presaveFolder) : [];
    const newRels = this.getFolderToScopeIdToIdRels(folder);
    const relsDiff = PartengHelper.computeIdToIdRelationsDiff(oldRels, newRels);
    const { created, deleted } = relsDiff;

    // NB. No requests for "updated" rels
    const createRels$ =
      created.length > 0 ? forkJoin(created.map((rel) => this.saveRelFolderToScope$(rel[0], rel[1]))) : of([]);
    const deleteRels$ =
      deleted.length > 0 ? forkJoin(deleted.map((rel) => this.deleteRelFolderToScope$(rel[0], rel[1]))) : of([]);

    return forkJoin([createRels$, deleteRels$]);
  }

  private getFolderToScopeIdToIdRels(folder: Folder): IdToIdRel[] {
    return folder.relFolderToScopes.map((rel) => rel.scope).map((scope) => [folder.id, scope.id]);
  }

  // PUT rel_folders_to_scopes
  private saveRelFolderToScope$(folderId: number, scopeId: number) {
    const body = { status: this.settingsService.get<number>('STATUS_ACTIVE')! };
    return this.restService.put({ url: `${environment.api.baseURL}/folders/${folderId}/scopes/${scopeId}`, body });
  }

  //
  // ----- DELETE
  //

  // Delete all folders for the given project
  deleteProjectFolders$(project: Project) {
    return project.folders.length > 0
      ? forkJoin(project.folders.map((folder) => this.deleteProjectFolder$(folder)))
      : of([]);
  }

  private deleteProjectFolder$(folder: Folder) {
    const deleteFolderToScopes$ =
      folder.relFolderToScopes.length > 0
        ? forkJoin(
            folder.relFolderToScopes.map((relFolderToScope) =>
              this.deleteRelFolderToScope$(folder.id, relFolderToScope.scope.id)
            )
          )
        : of([]);
    const deleteFolder$ = this.deleteFolder$(folder.id);
    return deleteFolderToScopes$.pipe(mergeMap(() => deleteFolder$));
  }

  // DELETE rel_folders_to_scopes
  private deleteRelFolderToScope$(folderId: number, scopeId: number) {
    return this.restService.delete({ url: `${environment.api.baseURL}/folders/${folderId}/scopes/${scopeId}` });
  }

  private deleteFolder$(folderId: number) {
    return this.restService.delete({ url: `${environment.api.baseURL}/folders/${folderId}` });
  }

  private deleteRemovedProjectFolders$(project: Project, presaveProject: Project) {
    const presaveFolderIds = presaveProject.folders.map((folder) => folder.id);
    const currentFolderIds = project.folders.map((folder) => folder.id);
    const folderIdsToDelete = presaveFolderIds.filter((id) => !currentFolderIds.includes(id));
    return this.deleteGivenFolders(folderIdsToDelete.map((id) => presaveProject.folders.find((f) => f.id === id)!));
  }

  private deleteGivenFolders(folders: Folder[]) {
    return folders.length > 0 ? forkJoin(folders.map((folder) => this.deleteProjectFolder$(folder))) : of([]);
  }
}
