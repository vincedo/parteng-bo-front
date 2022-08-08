import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { JsHelper } from '@app/core/helpers';
import { TableColumnDef } from '@app/core/models';
import { Person, PERSON_TYPE, Project } from '@app/project/models';
import { PersonService } from '@app/project/services/person.service';
import { lastValueFrom, Observable, of } from 'rxjs';

export interface DialogFundManagerSelectorSharedData {
  project?: Project;
  disablePersonCreation?: boolean;
}

@Component({
  selector: 'parteng-dialog-fund-manager-selector-shared',
  template: `
    <section class="dialog-fund-manager-selector">
      <parteng-dialog-item-selector
        *ngIf="fundManagers$ | async as fundManagers"
        [dialogTitle]="'project.dialogFundManagerSelector.title' | translate"
        [dialogDescription]="'project.dialogFundManagerSelector.description' | translate"
        [selectedItemsTitle]="'project.dialogFundManagerSelector.selectedItemsTitle' | translate"
        [selectedItemsDescription]="'project.dialogFundManagerSelector.selectedItemsDescription' | translate"
        [itemAdditionalInfoTitle]="'shared.dialogPersonSelector.itemAdditionalInfoTitle' | translate"
        [itemAdditionalInfoHTML]="itemAdditionalInfoHTML"
        [selectedItemPreviewHTML]="selectedItemPreviewHTML"
        [columnDefs]="columnDefs"
        [allItems]="fundManagers"
        [filterItemFn]="filterItemFn"
        [isMonoSelection]="true"
      >
        <!-- Additional Info -->
        <ng-template #itemAdditionalInfoHTML let-person="item">
          <parteng-person-additional-info [person]="person"></parteng-person-additional-info>
        </ng-template>
        <!-- Selected Item Preview -->
        <ng-template #selectedItemPreviewHTML let-person="item">
          <div class="flex text-sm">
            <div class="w-16">{{ person.id }}</div>
            <div class="flex-auto">{{ person.name }}</div>
            <div class="flex-none">{{ person.person_type | personTypeToTranslatedLabel }}</div>
          </div>
        </ng-template>
        <!-- Add Item Button -->
        <button
          *ngIf="!dialogParams.disablePersonCreation"
          type="button"
          mat-stroked-button
          (click)="openAddLegalPersonDialog()"
        >
          {{ 'project.dialogFundManagerSelector.createItem' | translate }}
        </button>
      </parteng-dialog-item-selector>
    </section>
  `,
})
export class DialogFundManagerSelectorSharedComponent {
  fundManagers$: Observable<Person[]> = of([]);
  PERSON_TYPE = PERSON_TYPE;

  columnDefs: TableColumnDef[] = [
    { key: 'id', labelTranslateKey: 'shared.dialogPersonSelector.columnId' },
    { key: 'name', labelTranslateKey: 'shared.dialogPersonSelector.columnName' },
    { key: 'short_name', labelTranslateKey: 'shared.dialogPersonSelector.columnShortName' },
    {
      key: 'person_type',
      labelTranslateKey: 'shared.dialogPersonSelector.columnType',
      pipeName: 'personTypeToTranslatedLabel',
    },
  ];

  constructor(
    private personService: PersonService,
    private diaglogRef: MatDialogRef<DialogFundManagerSelectorSharedComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogParams: DialogFundManagerSelectorSharedData
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

  async openAddLegalPersonDialog() {
    const newPerson = await lastValueFrom(this.personService.showFundManagerCreationDialog(this.dialogParams.project));
    if (newPerson) {
      const createdPerson = await lastValueFrom(this.personService.save$(newPerson));
      this.diaglogRef.close([createdPerson]);
    }
    this.refreshList();
  }

  async refreshList() {
    this.fundManagers$ = of(
      (await lastValueFrom(this.personService.getAll$())).filter((person) => this.personService.isLegalPerson(person))
    );
  }
}
