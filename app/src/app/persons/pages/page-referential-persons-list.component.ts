import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { BaseComponent } from '@app/core/components';
import { ServicesStore } from '@app/core/store/services.store';
import { Person } from '@app/project/models';
import { PersonService } from '@app/project/services/person.service';
import { lastValueFrom, Observable, tap } from 'rxjs';
import {
  PageReferentialPersonsListData,
  PAGE_REFERENTIAL_PERSONS_LIST_DATA,
  PAGE_REFERENTIAL_PERSONS_LIST_PROVIDERS,
} from './page-referential-persons-list.provider';

const STATE_KEY = 'referentialPersonsData';
@Component({
  selector: 'parteng-page-referential-persons-list',
  template: `
    <section *ngIf="personsData$ | async as data" class="page-referential-persons-list w-[1240px] h-full mx-auto">
      <!-- Header -->
      <div class="page-header">
        <div class="my-4">
          <parteng-page-title [title]="'persons.pagePersonsList.breadcrumbTitle' | translate"></parteng-page-title>
          <parteng-breadcrumb
            [breadcrumb]="[{ label: 'persons.pagePersonsList.breadcrumbTitle' | translate }]"
          ></parteng-breadcrumb>
        </div>

        <div class="flex justify-between">
          <div class="flex-auto">
            <h1 class="text-lg font-semibold pl-4 border-l-[3px] border-blue-ptg-primary-800">
              {{ 'persons.pagePersonsList.title' | translate }}
            </h1>
            <div [innerHTML]="'persons.pagePersonsList.description' | translate"></div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="h-[680px] mt-5">
        <parteng-persons-list
          [persons]="sortPersons(data.persons)"
          [withStatusFilter]="true"
          [selectedPerson]="selectedPerson"
          (personSelected)="selectedPerson = $event"
        ></parteng-persons-list>
      </div>

      <!-- Footer -->
      <div class="page-footer flex items-center justify-end mt-3">
        <div>
          <button
            type="button"
            mat-raised-button
            color="primary"
            (click)="showSelectedPersonDialog(selectedPerson!)"
            [disabled]="!selectedPerson"
            parteng-requires-permission="read"
            parteng-requires-resource="persons"
            data-testId="show-selected-person-button"
          >
            {{ 'project.pageProjectsList.footer.viewBtn' | translate }}
          </button>
        </div>
      </div>
    </section>
  `,
  providers: PAGE_REFERENTIAL_PERSONS_LIST_PROVIDERS,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageReferentialPersonsListComponent extends BaseComponent {
  personsData$: Observable<PageReferentialPersonsListData> = this.servicesStore
    .select<PageReferentialPersonsListData>(STATE_KEY)
    .pipe(
      tap(
        (personsData) =>
          (this.selectedPerson = personsData.persons.find((person) => person.id === this.selectedPerson?.id))
      )
    );
  selectedPerson: Person | undefined;

  constructor(
    @Inject(PAGE_REFERENTIAL_PERSONS_LIST_DATA) public data$: Observable<PageReferentialPersonsListData>,
    private personService: PersonService,
    private servicesStore: ServicesStore
  ) {
    super();
  }

  ngOnInit() {
    this.servicesStore.dispatch(this.data$, STATE_KEY);
  }

  sortPersons(persons: Person[]) {
    return ([...persons] || []).sort(
      (b, a) => a.person_type - b.person_type || (b.name || '').localeCompare(a.name || '')
    );
  }

  async showSelectedPersonDialog(selectedPerson: Person) {
    await lastValueFrom(
      this.personService.showPersonDialog({
        personType: selectedPerson.person_type,
        mode: 'view',
        person: this.selectedPerson,
        showDeleteButton: true,
        disablePersonCreation: true,
      })
    );
    this.servicesStore.dispatch(this.data$, STATE_KEY);
  }
}
