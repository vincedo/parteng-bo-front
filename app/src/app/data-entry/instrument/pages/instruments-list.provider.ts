import { InjectionToken, Provider } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Instrument2 } from '@app/data-entry/models/instrument.model';
import { InstrumentService2 } from '@app/data-entry/services/instrument2.service';
import { Project } from '@app/project/models';
import { ProjectService } from '@app/project/services/project.service';
import { filter, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';

export interface PageInstrumentsListData {
  instruments: Instrument2[];
  folderName: string;
  project: Project;
}

export const PAGE_INSTRUMENTS_LIST_DATA = new InjectionToken<PageInstrumentsListData>('PAGE_INSTRUMENTS_LIST_DATA');

export const PAGE_INSTRUMENTS_LIST_PROVIDERS: Provider[] = [
  {
    provide: PAGE_INSTRUMENTS_LIST_DATA,
    deps: [ActivatedRoute, InstrumentService2, ProjectService],
    useFactory: pageInstrumentsListFactory,
  },
];

export function pageInstrumentsListFactory(
  route: ActivatedRoute,
  instrumentService: InstrumentService2,
  projectService: ProjectService
): Observable<PageInstrumentsListData> {
  return route.params.pipe(
    filter((params) => !!params['projectId']),
    map((params) => [params['projectId'], params['folderId']]),
    switchMap(([projectId, folderId]) =>
      forkJoin([
        instrumentService.getInstrumentsByPseudoFolder$(projectId, folderId),
        projectService.getById$(projectId),
        of(folderId),
      ])
    ),
    map(([instruments, project, folderId]) => ({
      instruments: [...instruments].sort((a, b) => a.instrumentType!.order - b.instrumentType!.order || a.id - b.id),
      // .filter((i) => !!i && i.instrumentVersions![0]!.creationProjectId === project.id),
      project,
      folderName: folderId,
    }))
  );
}
