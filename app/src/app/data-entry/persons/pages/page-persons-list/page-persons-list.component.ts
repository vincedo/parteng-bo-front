import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/core/components';
import { ServicesStore } from '@app/core/store/services.store';
import { Person } from '@app/project/models';
import { PersonService } from '@app/project/services/person.service';
import { combineLatest, lastValueFrom, map, Observable, tap } from 'rxjs';
import { PagePersonsData, PAGE_PERSONS_DATA, PAGE_PERSONS_PROVIDERS } from '../persons.provider';

const STATE_KEY = 'personsData';
@Component({
  selector: 'parteng-page-persons-list',
  template: `
    <section *ngIf="personsData$ | async as data" class="w-full h-full mx-auto">
      <!-- Header -->
      <div class="page-header">
        <div class="flex justify-between">
          <div class="flex-auto">
            <h1 class="text-lg font-semibold pl-4 border-l-[3px] border-blue-ptg-primary-800">
              {{ 'dataEntry.pagePersonsList.title.' + data.folderId | translate }}
            </h1>
            <div [innerHTML]="'dataEntry.pagePersonsList.description' | translate" class="mb-7"></div>
          </div>
        </div>
      </div>
      <!-- Content -->
      <div class="h-[680px]">
        <parteng-persons-list
          *ngIf="data.persons && data.persons.length > 0; else noPersons"
          [persons]="data.persons"
          [selectedPerson]="selectedPerson"
          (personSelected)="selectedPerson = $event"
        ></parteng-persons-list>
        <ng-template #noPersons>
          <div class="mt-5 text-lg font-light">
            {{
              'dataEntry.pagePersonsList.noPerson.' + data.folderId | translate: { projectName: data.project?.longName }
            }}
          </div>
        </ng-template>
      </div>
      <!-- Footer -->
      <div class="page-footer flex items-center justify-end mt-4">
        <div>
          <button
            type="button"
            mat-raised-button
            color="primary"
            (click)="showSelectedPersonDialog(selectedPerson!, data)"
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
  providers: PAGE_PERSONS_PROVIDERS,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PagePersonsListComponent extends BaseComponent implements OnInit {
  selectedPerson: Person | undefined;
  personsData$: Observable<PagePersonsData> = combineLatest([
    this.servicesStore.select<PagePersonsData>(STATE_KEY),
    // Whenever we move to another folder, we deselect the selected person
    this.route.params.pipe(tap((_) => (this.selectedPerson = undefined))),
  ]).pipe(map(([personsData, _]) => personsData));

  constructor(
    @Inject(PAGE_PERSONS_DATA) public data$: Observable<PagePersonsData>,
    private personService: PersonService,
    private servicesStore: ServicesStore,
    private route: ActivatedRoute
  ) {
    super();
  }

  ngOnInit() {
    this.servicesStore.dispatch(this.data$, STATE_KEY);
  }

  async showSelectedPersonDialog(selectedPerson: Person, data: PagePersonsData) {
    await lastValueFrom(
      this.personService.showPersonDialog({
        project: data.project,
        personType: selectedPerson.person_type,
        mode: 'view',
        person: this.selectedPerson,
        showDeleteButton: false,
      })
    );
    this.servicesStore.dispatch(this.data$, STATE_KEY);
  }
}
