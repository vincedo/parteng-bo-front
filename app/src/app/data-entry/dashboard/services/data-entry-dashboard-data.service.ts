/**
 * @file
 * Service loading all data required by DataEntryDashboard.
 */
import { Injectable } from '@angular/core';
import { PSEUDO_FOLDER } from '@app/data-entry/models';
import { Folder, Project } from '@app/project/models';
import { FolderService } from '@app/project/services/folder.service';
import { ProjectService } from '@app/project/services/project.service';
import { forkJoin, Observable, of } from 'rxjs';

export interface DataEntryDashboardData {
  project: Project;
  folder: Folder | PSEUDO_FOLDER;
}

@Injectable({ providedIn: 'root' })
export class DataEntryDashboardDataService {
  constructor(private projectService: ProjectService, private folderService: FolderService) {}

  getData$(projectId: number, folderId?: number | PSEUDO_FOLDER): Observable<DataEntryDashboardData> {
    return forkJoin({
      project: this.projectService.getById$(projectId),
      folder:
        (folderId as PSEUDO_FOLDER) in PSEUDO_FOLDER
          ? of(folderId as PSEUDO_FOLDER)
          : this.folderService.getById$(folderId as number),
    });
  }
}
