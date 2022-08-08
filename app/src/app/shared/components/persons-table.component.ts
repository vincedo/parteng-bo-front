import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Person } from '@app/project/models';
import { PersonService } from '@app/project/services/person.service';
import { VALIDATION_STATUS } from '@app/shared/models';
import { LegalEntityTypePipe } from '@app/shared/pipes/legal-entity-type.pipe';

@Component({
  selector: 'parteng-persons-table',
  template: `
    <table
      mat-table
      [dataSource]="dataSource"
      matSort
      matSortDisableClear
      [trackBy]="trackPersonById"
      [fixedLayout]="true"
      class="w-full persons-list-table"
    >
      <!-- ID -->
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500 w-[75px]">
          {{ 'dataEntry.pagePersonsList.personsTable.id' | translate }}
        </th>
        <td mat-cell *matCellDef="let person" class="text-xs">
          {{ person.id | dashOnEmpty }}
        </td>
      </ng-container>
      <!-- Name -->
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500">
          {{ 'dataEntry.pagePersonsList.personsTable.name' | translate }}
        </th>
        <td mat-cell *matCellDef="let person" class="text-xs">
          {{ person.name | dashOnEmpty }}
        </td>
      </ng-container>
      <!-- Short Name-->
      <ng-container matColumnDef="short_name">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500">
          {{ 'dataEntry.pagePersonsList.personsTable.shortName' | translate }}
        </th>
        <td mat-cell *matCellDef="let person" class="text-xs">
          {{ person.short_name | dashOnEmpty }}
        </td>
      </ng-container>
      <!-- Person Type -->
      <ng-container matColumnDef="person_type">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500 whitespace-pre-line">
          {{ 'dataEntry.pagePersonsList.personsTable.personType' | translate }}
        </th>
        <td mat-cell *matCellDef="let person" class="text-xs">
          {{ person.person_type | personTypeToTranslatedLabel | dashOnEmpty }}
        </td>
      </ng-container>
      <!-- Legal Entity Type -->
      <ng-container matColumnDef="legal_entity_types_id">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500 whitespace-pre-line">
          {{ 'dataEntry.pagePersonsList.personsTable.legalEntityType' | translate }}
        </th>
        <td mat-cell *matCellDef="let person" class="text-xs">
          {{ (person.legal_entity_types_id | legalEntityType) || (person.fund_types_id | fundType) | dashOnEmpty }}
        </td>
      </ng-container>
      <!-- Country -->
      <ng-container matColumnDef="legal_entity_country_code">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500 whitespace-pre-line">
          {{ 'dataEntry.pagePersonsList.personsTable.country' | translate }}
        </th>
        <td mat-cell *matCellDef="let person" class="text-xs">
          {{ person.legal_entity_country_code | dashOnEmpty }}
        </td>
      </ng-container>
      <!-- Legal Identity Identifier -->
      <ng-container matColumnDef="legal_entity_identifier">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500 whitespace-pre-line">
          {{ 'dataEntry.pagePersonsList.personsTable.legalEntityIdentifier' | translate }}
        </th>
        <td mat-cell *matCellDef="let person" class="text-xs">
          {{
            person.legal_entity_identifier ||
              (isLegalPerson(person)
                ? ('dataEntry.pagePersonsList.personsTable.legalEntityIdentifierProcess' | translate)
                : '-')
          }}
        </td>
      </ng-container>
      <!-- Creation Project -->
      <ng-container matColumnDef="creation_project">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500 whitespace-pre-line">
          {{ 'dataEntry.pagePersonsList.personsTable.creationProject' | translate }}
        </th>
        <td mat-cell *matCellDef="let person" class="text-xs">
          {{ person.creationProject?.long_name || '-' }}
        </td>
      </ng-container>
      <!-- Status -->
      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef class="text-blue-ptg-secondary-500 whitespace-pre-line">
          {{ 'dataEntry.pagePersonsList.personsTable.status' | translate }}
        </th>
        <td mat-cell *matCellDef="let person" class="text-xs">
          <mat-icon>{{
            person.validation_status === VALIDATION_STATUS.NOT_REVIEWED ? 'lock_open' : 'locked'
          }}</mat-icon>
        </td>
      </ng-container>
      <!-- ROW Templates (TR) -->
      <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
      <tr
        mat-row
        *matRowDef="let row; columns: displayedColumns"
        (click)="clickRow(row)"
        class="select-none cursor-pointer"
        [class.bg-neutral-100]="isSelected(row)"
      ></tr>
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PersonsTableComponent implements OnChanges, AfterViewInit {
  @Input() persons: Person[] = [];
  @Input() selectedPerson: Person | undefined;

  @Output() rowClicked = new EventEmitter<Person>();

  @ViewChild(MatSort) sort!: MatSort;

  VALIDATION_STATUS = VALIDATION_STATUS;

  displayedColumns = [
    'id',
    'name',
    'short_name',
    'person_type',
    'legal_entity_types_id',
    'legal_entity_country_code',
    'legal_entity_identifier',
    'creation_project',
    'status',
  ];
  dataSource: MatTableDataSource<Person> = new MatTableDataSource<Person>([]);

  constructor(
    private legalEntityTypePipe: LegalEntityTypePipe,
    private cdr: ChangeDetectorRef,
    private personService: PersonService
  ) {}

  ngOnChanges(changes: SimpleChanges) {
    changes && changes['persons'] && this.setDataSource(this.persons);
    changes && changes['selectedPerson'] && this.cdr.detectChanges();
  }

  // Needed because mat-sort
  ngAfterViewInit(): void {
    this.setDataSource(this.persons);
  }

  setDataSource(persons: Person[]) {
    this.dataSource = new MatTableDataSource<Person>(persons);
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item: Person, property): any => {
      return (
        {
          legal_entity_types_id: this.legalEntityTypePipe.transform(item.legal_entity_types_id || 0),
        }[property] || (item as any)[property]
      );
    };
  }

  // TODO: create a pipe instead of this
  isLegalPerson(person: Person) {
    return this.personService.isLegalPerson(person);
  }

  trackPersonById(index: number, person: Person): number {
    return person.id;
  }

  isSelected(person: Person): boolean {
    return this.selectedPerson?.id === person.id;
  }

  clickRow(person: Person): void {
    this.rowClicked.emit(person);
  }
}
