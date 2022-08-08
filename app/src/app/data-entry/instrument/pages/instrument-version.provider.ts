import { InjectionToken, Provider } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AttributeType } from '@app/data-entry/models/attribute-type.model';
import { InstrumentVersion } from '@app/data-entry/models/instrument-version.model';
import { Instrument2 } from '@app/data-entry/models/instrument.model';
import { RepaymentType } from '@app/data-entry/models/repayment-type.model';
import { AttributeTypeService } from '@app/data-entry/services/attribute-type.service';
import { InstrumentService2 } from '@app/data-entry/services/instrument2.service';
import { RepaymentTypeService } from '@app/data-entry/services/repayment-type.service';
import { ValueTypeService } from '@app/data-entry/services/value-type.service';
import { Person, Project } from '@app/project/models';
import { PersonService } from '@app/project/services/person.service';
import { ProjectService } from '@app/project/services/project.service';
import { filter, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';

export interface PageInstrumentVersionData {
  instrument: Instrument2;
  attributeTypes: AttributeType[];
  persons: Person[];
  instruments: Instrument2[];
  repaymentTypes: RepaymentType[];
  project: Project | undefined;
  instrumentVersion: InstrumentVersion;
  readonly?: boolean;
}

export const PAGE_INSTRUMENT_VERSION_DATA = new InjectionToken<PageInstrumentVersionData>(
  'PAGE_INSTRUMENT_VERSION_DATA'
);

export const PAGE_INSTRUMENT_VERSION_PROVIDERS: Provider[] = [
  {
    provide: PAGE_INSTRUMENT_VERSION_DATA,
    deps: [
      ActivatedRoute,
      ProjectService,
      InstrumentService2,
      AttributeTypeService,
      PersonService,
      ValueTypeService,
      RepaymentTypeService,
    ],
    useFactory: pageInstrumentVersionCreateDataFactory,
  },
];

export function pageInstrumentVersionCreateDataFactory(
  route: ActivatedRoute,
  projectService: ProjectService,
  instrumentService: InstrumentService2,
  attributeTypeService: AttributeTypeService,
  personService: PersonService,
  valueTypeService: ValueTypeService,
  repaymentTypeService: RepaymentTypeService
): Observable<PageInstrumentVersionData> {
  const data: PageInstrumentVersionData = {} as PageInstrumentVersionData;
  return route.params.pipe(
    filter((params) => !!params['projectId'] && !!params['instrumentId']),
    map((params) => [params['instrumentId'], params['projectId'], params['instrumentVersionId']]),
    switchMap(([instrumentId, projectId, instrumentVersionId]) =>
      forkJoin([
        instrumentService.getInstrumentById(instrumentId),
        +projectId ? projectService.getById$(projectId) : of(undefined),
        attributeTypeService.getAll$(),
        personService.getAll$(),
        instrumentService.getAll$(),
        valueTypeService.getAll$(),
        repaymentTypeService.getAll$(),
        of(+instrumentVersionId),
        // TODO: do not use snapshot
        of(route.snapshot.queryParams['readonly']),
      ])
    ),
    tap(
      ([
        instrument,
        project,
        attributeTypes,
        persons,
        instruments,
        valueTypes,
        repaymentTypes,
        instrumentVersionId,
        readonly,
      ]) => {
        data.readonly = readonly;
        data.instrument = instrument;
        data.project = project;
        data.attributeTypes = attributeTypes;
        data.persons = persons;
        data.instruments = instruments;
        data.repaymentTypes = repaymentTypes;
        data.attributeTypes.forEach((at) => {
          at.valueType = valueTypes.find((vt) => vt.id === at.valueTypeId)!;
        });
        data.instrument.instrumentVersions?.forEach((version) => {
          version.attributes.forEach((attribute) => {
            attribute.person = persons.find((person) => person.id === attribute.personId);
            attribute.instrument = instruments.find((inst) => inst.id === attribute.instrumentId);
          });
        });
        data.instrumentVersion = instrument.instrumentVersions!.find((version) => version.id === instrumentVersionId)!;
      }
    ),
    switchMap(([instrument]) => attributeTypeService.getByInstrumentType$(instrument.instrumentType!.id)),
    tap((attributeTypes) => {
      data.instrument.instrumentVersions?.forEach((version) => {
        version.attributes.forEach((attribute) => {
          attribute.attributeType = attributeTypes.find((at) => at.id === attribute.attributeTypeId)!;
        });
      });
    }),
    map((_) => data)
  );
}
