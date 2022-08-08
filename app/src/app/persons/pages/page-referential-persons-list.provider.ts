import { InjectionToken, Provider } from '@angular/core';
import { Person } from '@app/project/models';
import { PersonService } from '@app/project/services/person.service';
import { ProjectService } from '@app/project/services/project.service';
import { forkJoin, map, Observable } from 'rxjs';

export interface PageReferentialPersonsListData {
  persons: Person[];
}

export const PAGE_REFERENTIAL_PERSONS_LIST_DATA = new InjectionToken<PageReferentialPersonsListData>(
  'PAGE_REFERENTIAL_PERSONS_LIST_DATA'
);

export const PAGE_REFERENTIAL_PERSONS_LIST_PROVIDERS: Provider[] = [
  {
    provide: PAGE_REFERENTIAL_PERSONS_LIST_DATA,
    deps: [PersonService, ProjectService],
    useFactory: pageReferentialPersonsListFactory,
  },
];

export function pageReferentialPersonsListFactory(
  personService: PersonService,
  projectService: ProjectService
): Observable<PageReferentialPersonsListData> {
  return forkJoin([personService.getAll$(), projectService.getAll$()]).pipe(
    map(([persons, projects]) => {
      persons.forEach((person) => {
        person.creationProject = projects.find((project) => project.id === person.creation_projects_id);
      });
      return { persons };
    })
  );
}
