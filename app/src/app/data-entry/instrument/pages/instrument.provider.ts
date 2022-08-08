import { InjectionToken, Provider } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PSEUDO_FOLDER } from '@app/data-entry/models';
import { Instrument2 } from '@app/data-entry/models/instrument.model';
import { InstrumentService2 } from '@app/data-entry/services/instrument2.service';
import { Project } from '@app/project/models';
import { ProjectService } from '@app/project/services/project.service';
import { filter, forkJoin, map, Observable, of, switchMap } from 'rxjs';

export interface PageInstrumentData {
  instrument: Instrument2;
  project: Project | undefined;
  readonly?: boolean;
  sourceFolder?: PSEUDO_FOLDER;
}

export const PAGE_INSTRUMENT_DATA = new InjectionToken<PageInstrumentData>('PAGE_INSTRUMENT_DATA');

export const PAGE_INSTRUMENT_PROVIDERS: Provider[] = [
  {
    provide: PAGE_INSTRUMENT_DATA,
    deps: [ActivatedRoute, InstrumentService2, ProjectService],
    useFactory: pageInstrumentFactory,
  },
];

export function pageInstrumentFactory(
  route: ActivatedRoute,
  instrumentService: InstrumentService2,
  projectService: ProjectService
): Observable<PageInstrumentData> {
  return route.params.pipe(
    filter((params) => !!params['projectId'] && !!params['instrumentId']),
    map((params) => [params['instrumentId'], params['projectId']]),
    switchMap(([instrumentId, projectId]) =>
      forkJoin([
        instrumentService.getInstrumentById(instrumentId),
        +projectId ? projectService.getById$(projectId) : of(undefined),
        // TODO: do not use snapshot
        of(route.snapshot.queryParams['readonly']),
        of(route.snapshot.queryParams['sourceFolder']),
      ])
    ),
    map(([instrument, project, readonly, sourceFolder]) => ({
      instrument,
      project,
      readonly,
      sourceFolder,
    }))
  );
}
