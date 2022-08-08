import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { BaseComponent } from '@app/core/components';
import { JsHelper } from '@app/core/helpers';
import { Person } from '@app/project/models';

@Component({
  selector: 'parteng-persons-list',
  template: `
    <div class="h-full flex flex-col">
      <parteng-list-filters
        [statusFilter]="withStatusFilter ? statusFilter : undefined"
        [textFilter]="textFilter"
        (statusFilterChanged)="statusFilterChanged($event)"
        (textFilterChanged)="textFilterChanged($event)"
      ></parteng-list-filters>

      <div class="flex-auto overflow-y-auto" *ngIf="filteredPersons">
        <parteng-persons-table
          [persons]="filteredPersons"
          [selectedPerson]="selectedPerson"
          (rowClicked)="onPersonClicked($event)"
        ></parteng-persons-table>
      </div>
      <div class="text-sm p-3 rounded mt-3 border min-h-[100px]">
        <div class="text-blue-ptg-primary-800">
          {{ 'dataEntry.pagePersonsList.comment' | translate }}
          <div *ngIf="selectedPerson" class="text-neutral-700">
            {{ selectedPerson.comment || '-' }}
          </div>
        </div>
      </div>
    </div>
  `,
})
export class PersonsListComponent extends BaseComponent {
  @Input() persons: Person[] = [];
  @Input() selectedPerson: Person | undefined;
  @Input() withStatusFilter = false;

  @Output() personSelected = new EventEmitter<Person>();

  statusFilter: number = -1;
  textFilter: string = '';
  filteredPersons: Person[] = [];

  constructor() {
    super();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes && changes['persons']) {
      this.filteredPersons = this.filter(this.persons, this.textFilter, this.statusFilter);
    }
  }

  statusFilterChanged(e: any) {
    this.statusFilter = e;
    this.filteredPersons = this.filter(this.persons, this.textFilter, this.statusFilter);
  }

  textFilterChanged(e: any) {
    this.textFilter = e;
    this.filteredPersons = this.filter(this.persons, this.textFilter, this.statusFilter);
  }

  filter(persons: Person[], textFilter: string, statusFilter: number) {
    const normalize = (str: string) => JsHelper.strNormalize(str, { trim: true, lowercase: true, removeAccents: true });
    return (persons || []).filter(
      (person) =>
        (statusFilter === undefined || statusFilter === -1 || person.validation_status === statusFilter) &&
        (normalize(person.id.toString()) === normalize(textFilter) ||
          normalize(person.name || '').includes(normalize(textFilter)) ||
          normalize(person.legal_entity_identifier?.toString() || '').includes(normalize(textFilter)) ||
          normalize(person.comment || '').includes(normalize(textFilter)) ||
          normalize(person.short_name || '').includes(normalize(textFilter)))
    );
  }

  onPersonClicked(person: Person) {
    this.selectedPerson = person;
    this.personSelected.emit(person);
  }
}
