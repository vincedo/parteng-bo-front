import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { lastValueFrom, map, Observable, of } from 'rxjs';

import { JsHelper } from '@app/core/helpers';
import { TableColumnDef } from '@app/core/models';
import { Scope } from '@app/project/models';
import { ScopeService } from '@app/project/services/scope.service';
import { DialogItemSelectorComponent } from '../dialog-item-selector/dialog-item-selector.component';

export interface DialogScopeSelectorData {
  dialogTitle: string;
  dialogDescription: string;
  selectedItemsTitle: string;
  selectedItemsDescription: string;
  itemAdditionalInfoTitle: string;
  selectedScopes: Scope[];
  hideAddItemButton: boolean;
}

@Component({
  selector: 'parteng-dialog-scope-selector-shared',
  template: `
    <section class="dialog-scope-selector-shared">
      <parteng-dialog-item-selector
        *ngIf="scopes$ | async as scopes"
        [dialogTitle]="dialogData.dialogTitle"
        [dialogDescription]="dialogData.dialogDescription"
        [selectedItemsTitle]="dialogData.selectedItemsTitle"
        [selectedItemsDescription]="dialogData.selectedItemsDescription"
        [itemAdditionalInfoTitle]="dialogData.itemAdditionalInfoTitle"
        [itemAdditionalInfoHTML]="itemAdditionalInfoHTML"
        [selectedItemPreviewHTML]="selectedItemPreviewHTML"
        [columnDefs]="columnDefs"
        [allItems]="scopes"
        [defaultSelectedItems]="dialogData.selectedScopes"
        [filterItemFn]="filterItemFn"
        itemsSortProperty="code"
        [hideAddItemButton]="dialogData.hideAddItemButton"
      >
        <!-- Additional Info -->
        <ng-template #itemAdditionalInfoHTML let-scope="item">
          <p class="text-sm text-neutral-700">
            {{ scope.comment || '-' }}<br />
            <span class="font-bold">{{ 'scopes.pageScopesList.detailsAreaWorlds' | translate }} :</span>
            {{ stringifyScopeWorlds(scope) }}
          </p>
        </ng-template>
        <!-- Selected Item Preview -->
        <ng-template #selectedItemPreviewHTML let-scope="item">
          <div class="flex text-sm">
            <div class="w-16">{{ scope.code }}</div>
            <div>{{ scope.name }}</div>
          </div>
        </ng-template>
        <!-- Add Item Button -->
        <button type="button" mat-stroked-button (click)="openAddScopeDialog()">
          {{ 'project.dialogScopeSelector.createItem' | translate }}
        </button>
      </parteng-dialog-item-selector>
      <ng-template #loading>
        <div class="h-48 w-full">
          <mat-spinner class="mx-auto mt-32" color="accent" [diameter]="30"></mat-spinner>
        </div>
      </ng-template>
    </section>
  `,
})
export class DialogScopeSelectorSharedComponent implements OnInit {
  @ViewChild(DialogItemSelectorComponent) dialogItemSelectorComponent!: DialogItemSelectorComponent<Scope>;

  scopes$: Observable<Scope[]> = of([]);

  columnDefs: TableColumnDef[] = [
    { key: 'code', labelTranslateKey: 'project.dialogScopeSelector.columnCode' },
    { key: 'name', labelTranslateKey: 'project.dialogScopeSelector.columnName' },
    { key: 'historical_name', labelTranslateKey: 'project.dialogScopeSelector.columnHistoricalNames' },
    { key: 'city', labelTranslateKey: 'project.dialogScopeSelector.columnCity' },
  ];

  constructor(
    private scopeService: ScopeService,
    private dialogRef: MatDialogRef<any>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogScopeSelectorData
  ) {}

  async ngOnInit(): Promise<void> {
    this.refreshList();
  }

  filterItemFn(item: Scope, filter: string) {
    return JsHelper.ObjPropsContainString(item, filter, ['code', 'name', 'historicalName', 'city', 'comment']);
  }

  stringifyScopeWorlds(scope: Scope): string {
    return scope.worlds.map((w) => w.name).join(', ');
  }

  async openAddScopeDialog() {
    const createdScope = await lastValueFrom(this.scopeService.showScopeDialog({ mode: 'create' }));
    if (createdScope) {
      this.dialogItemSelectorComponent.selectItem(createdScope);
      // return this.dialogRef.close([createdScope]);
    }
    // We refresh even if user canceled the creation because they may have added a person
    // in a different dialog (fund manager...)
    this.refreshList();
  }

  async refreshList() {
    // Note. Scopes are already sorted in getAll$()
    const selectedScopeIds = this.dialogData.selectedScopes ? this.dialogData.selectedScopes.map((s) => s.id) : [];
    this.scopes$ = of(
      (await lastValueFrom(
        this.scopeService.getAll$().pipe(map((scopes) => scopes.filter((s) => !selectedScopeIds.includes(s.id))))
      )) || []
    );

    // this.scopes$ = of(
    //   (await lastValueFrom(
    //     this.scopeService.getAll$().pipe(
    //       map((scopes) => [
    //         ...scopes.sort((a, b) => {
    //           if (a.name < b.name) {
    //             return -1;
    //           }
    //           if (a.name > b.name) {
    //             return 1;
    //           }
    //           return 0;
    //         }),
    //       ])
    //     )
    //   )) || []
    // );
  }
}
