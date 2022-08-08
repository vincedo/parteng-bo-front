import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { JsHelper } from '@app/core/helpers';
import { TableColumnDef } from '@app/core/models';
import { Person, PERSON_TYPE, Project } from '@app/project/models';
import { PersonService } from '@app/project/services/person.service';
import { lastValueFrom, map, Observable, of } from 'rxjs';

export interface DialogPersonsSelectorData {
  project: Project;
  dialogTitle: string;
  dialogDescription: string;
  additionalInfoTitle: string;
  selectedPersons: Person[];
  disableAddPersonButton: boolean;
  isMonoSelection: boolean;
}

@Component({
  selector: 'parteng-dialog-persons-selector',
  template: `
    <section class="dialog-person-selector">
      <parteng-dialog-item-selector
        *ngIf="persons$ | async as persons"
        [dialogTitle]="dialogParams.dialogTitle"
        [dialogDescription]="dialogParams.dialogDescription"
        [itemAdditionalInfoTitle]="dialogParams.additionalInfoTitle"
        [itemAdditionalInfoHTML]="itemAdditionalInfoHTML"
        [selectedItemPreviewHTML]="selectedItemPreviewHTML"
        [columnDefs]="columnDefs"
        [allItems]="persons"
        [defaultSelectedItems]="dialogParams.selectedPersons"
        [filterItemFn]="filterItemFn"
        [isMonoSelection]="dialogParams.isMonoSelection"
      >
        <!-- Additional Info -->
        <ng-template #itemAdditionalInfoHTML let-person="item">
          <parteng-person-additional-info [person]="person"></parteng-person-additional-info>
        </ng-template>

        <!-- Selected Item Preview -->
        <ng-template #selectedItemPreviewHTML let-person="item">
          <div class="flex text-sm w-full">
            <div class="pr-3">{{ person.name }}</div>
            <div>{{ person.person_type | personTypeToTranslatedLabel }}</div>
          </div>
        </ng-template>

        <!-- Add Item Button -->
        <button [disabled]="dialogParams.disableAddPersonButton" mat-stroked-button [matMenuTriggerFor]="menu">
          {{ 'shared.dialogPersonSelector.createItem' | translate }}
          <mat-icon aria-hidden="true">arrow_drop_down</mat-icon>
        </button>
        <mat-menu #menu="matMenu">
          <button mat-menu-item (click)="openAddPersonDialog(getPersonType(PERSON_TYPE.LEGAL_PERSON))">
            {{ 'shared.dialogPersonSelector.createItemLegalPerson' | translate }}
          </button>
          <button mat-menu-item (click)="openAddPersonDialog(getPersonType(PERSON_TYPE.NATURAL_PERSON))">
            {{ 'shared.dialogPersonSelector.createItemNaturalPerson' | translate }}
          </button>
          <button mat-menu-item (click)="openAddPersonDialog(getPersonType(PERSON_TYPE.INVESTMENT_FUND))">
            {{ 'shared.dialogPersonSelector.createItemInvestmentFund' | translate }}
          </button>
        </mat-menu>
      </parteng-dialog-item-selector>
      <ng-template #loading>
        <div class="h-48 w-full">
          <mat-spinner class="mx-auto mt-32" color="accent" [diameter]="30"></mat-spinner>
        </div>
      </ng-template>
    </section>
  `,
})
export class DialogPersonsSelectorComponent {
  persons$: Observable<Person[]> = of([]);
  PERSON_TYPE = PERSON_TYPE;

  columnDefs: TableColumnDef[] = [
    { key: 'id', labelTranslateKey: 'shared.dialogPersonSelector.columnId' },
    { key: 'name', labelTranslateKey: 'shared.dialogPersonSelector.columnName' },
    { key: 'short_name', labelTranslateKey: 'shared.dialogPersonSelector.columnShortName', pipeName: 'dashOnEmpty' },
    {
      key: 'person_type',
      labelTranslateKey: 'shared.dialogPersonSelector.columnType',
      pipeName: 'personTypeToTranslatedLabel',
    },
  ];

  constructor(
    private personService: PersonService,
    private dialogRef: MatDialogRef<DialogPersonsSelectorComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogParams: DialogPersonsSelectorData
  ) {}

  async ngOnInit() {
    this.refreshList();
  }

  filterItemFn(item: Person, filter: string) {
    return JsHelper.ObjPropsContainString(item, filter, [
      'id',
      'name',
      'legal_entity_identifier',
      'comment',
      'short_name',
    ]);
  }

  getPersonType(personType: PERSON_TYPE): number {
    return this.personService.getPersonType(personType);
  }

  async openAddPersonDialog(personType: PERSON_TYPE) {
    const createdPerson = await lastValueFrom(
      this.personService.showPersonDialog({ project: this.dialogParams.project, personType, mode: 'create' })
    );
    if (createdPerson) {
      return this.dialogRef.close([createdPerson]);
    }
    // We refresh even if user canceled the creation because he/she may have added a person
    // in a different dialog (fund manager...)
    this.refreshList();
  }

  async refreshList() {
    this.persons$ = of(
      (await lastValueFrom(
        this.personService.getAll$().pipe(map((persons) => [...persons.sort((b, a) => a.person_type - b.person_type)]))
      )) || []
    );
  }
}
