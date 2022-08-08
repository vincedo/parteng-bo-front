/**
 * @file
 * Service to return a lightweight version of the project name and project folder.
 */
import { Injectable } from '@angular/core';
import { VALIDATION_STATUS } from '@app/shared/models';

import { forkJoin, map, Observable, of } from 'rxjs';
import { FolderService } from './folder.service';

import { ProjectService } from './project.service';

export interface ProjectLight {
  id: number;
  long_name: string;
  validation_status: VALIDATION_STATUS;
}

export interface FolderLight {
  id: number;
  name: string;
  long_name: string;
  validation_status: VALIDATION_STATUS;
}

@Injectable({ providedIn: 'root' })
export class ProjectAndFolderLightService {
  constructor(private projectService: ProjectService, private folderService: FolderService) {}

  getProjectAndFolder$(opts: { projectId: number; folderId?: number }): Observable<{
    project: ProjectLight;
    folder?: FolderLight;
  }> {
    const getProject$: Observable<ProjectLight> = this.projectService.getById$(opts.projectId).pipe(
      map((project) => ({
        id: opts.projectId,
        long_name: project.longName,
        validation_status: project.validationStatus,
      }))
    );
    const getFolder$: Observable<FolderLight | undefined> = opts.folderId
      ? this.folderService.getById$(opts.folderId).pipe(
          map((folder) => ({
            id: opts.folderId!,
            name: folder.name,
            long_name: folder.longName,
            validation_status: folder.validationStatus,
          }))
        )
      : of(undefined);

    return forkJoin({ project: getProject$, folder: getFolder$ });
  }
}
