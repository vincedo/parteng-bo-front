import { InjectionToken, Provider } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InstrumentType } from '@app/data-entry/models';
import { RepaymentType } from '@app/data-entry/models/repayment-type.model';
import { InstrumentTypeService2 } from '@app/data-entry/services';
import { InstrumentService } from '@app/data-entry/services/instrument.service';
import { RepaymentTypeService } from '@app/data-entry/services/repayment-type.service';
import { Person, Project } from '@app/project/models';
import { PersonService } from '@app/project/services/person.service';
import { ProjectService } from '@app/project/services/project.service';
import { filter, forkJoin, map, Observable, switchMap } from 'rxjs';

export interface PageInstrumentCreateData {
  instrumentTypes: InstrumentType[];
  persons: Person[];
  repaymentTypes: RepaymentType[];
  project: Project;
}

export const PAGE_INSTRUMENT_CREATE_DATA = new InjectionToken<PageInstrumentCreateData>('PAGE_INSTRUMENT_CREATE_DATA');

export const PAGE_INSTRUMENT_CREATE_PROVIDERS: Provider[] = [
  {
    provide: PAGE_INSTRUMENT_CREATE_DATA,
    deps: [
      ActivatedRoute,
      InstrumentService,
      InstrumentTypeService2,
      ProjectService,
      PersonService,
      RepaymentTypeService,
    ],
    useFactory: pageInstrumentCreateFactory,
  },
];

export function pageInstrumentCreateFactory(
  route: ActivatedRoute,
  instrumentService: InstrumentService,
  instrumentTypeService2: InstrumentTypeService2,
  projectService: ProjectService,
  personService: PersonService,
  repaymentTypeService: RepaymentTypeService
): Observable<PageInstrumentCreateData> {
  return route.params.pipe(
    filter((params) => !!params['projectId']),
    map((params) => +params['projectId']),
    switchMap((projectId) =>
      forkJoin({
        project: projectService.getById$(projectId),
        instrumentTypes: instrumentTypeService2.getAll$(),
        persons: personService.getAll$(),
        repaymentTypes: repaymentTypeService.getAll$(),
      })
    )
  );
}
