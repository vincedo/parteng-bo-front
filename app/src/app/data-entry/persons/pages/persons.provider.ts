import { InjectionToken, Provider } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PSEUDO_FOLDER } from '@app/data-entry/models';
import { Person, Project } from '@app/project/models';
import { PersonService } from '@app/project/services/person.service';
import { ProjectService } from '@app/project/services/project.service';
import { filter, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';

export interface PagePersonsData {
  project: Project | undefined;
  persons: Person[];
  folderId: PSEUDO_FOLDER;
}

export const PAGE_PERSONS_DATA = new InjectionToken<PagePersonsData>('PAGE_PERSONS_DATA');

export const PAGE_PERSONS_PROVIDERS: Provider[] = [
  {
    provide: PAGE_PERSONS_DATA,
    deps: [ActivatedRoute, PersonService, ProjectService],
    useFactory: pagePersonsFactory,
  },
];

export function pagePersonsFactory(
  route: ActivatedRoute,
  personsService: PersonService,
  projectService: ProjectService
): Observable<PagePersonsData> {
  return route.params.pipe(
    filter((params) => !!params['projectId'] && !!params['folderId']),
    map((params) => [params['projectId'], params['folderId']]),
    switchMap(([projectId, folderId]) => {
      const persons$: Observable<Person[]> | undefined = {
        [PSEUDO_FOLDER.CREATED_PERSONS as string]: personsService.getCreatedPersons$(projectId),
        [PSEUDO_FOLDER.REFERENCED_PERSONS as string]: personsService.getReferencedPersons$(projectId),
      }[folderId];
      if (!persons$) {
        throw new Error(`Unknown folderId: ${folderId}`);
      }
      return forkJoin([persons$, +projectId ? projectService.getById$(projectId) : of(undefined), of(folderId)]);
    }),
    map(([persons, project, folderId]) => ({
      persons: ([...persons] || []).sort(
        (b, a) => a.person_type - b.person_type || (b.name || '').localeCompare(a.name || '')
      ),
      project,
      folderId,
    }))
  );
}
