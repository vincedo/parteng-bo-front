import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { JsHelper } from '@app/core/helpers';
import { TableColumnDef } from '@app/core/models';
import { Instrument2 } from '@app/data-entry/models/instrument.model';
import { InstrumentService2 } from '@app/data-entry/services/instrument2.service';
import { DialogItemSelectorComponent } from '@app/shared/components/dialog-item-selector/dialog-item-selector.component';
import { lastValueFrom, Observable } from 'rxjs';

export interface DialogInstrumentSelectorSharedParams {
  title: string;
  description: string;
  operation$?: Observable<Instrument2[]>;
}

type DisplayedInstrument = Instrument2 & { effectiveDate: string; creationProjectName: string };

@Component({
  selector: 'parteng-dialog-instrument-selector-shared',
  template: `
    <section class="dialog-instrument-selector">
      <parteng-dialog-item-selector
        *ngIf="instruments"
        [dialogTitle]="dialogParams.title"
        [dialogDescription]="dialogParams.description"
        [selectedItemsTitle]="'dataEntry.dialogInstrumentSelector.selectedItemsTitle' | translate"
        [selectedItemsDescription]="'dataEntry.dialogInstrumentSelector.selectedItemsDescription' | translate"
        [itemAdditionalInfoTitle]="'dataEntry.dialogInstrumentSelector.itemAdditionalInfoTitle' | translate"
        [itemAdditionalInfoHTML]="itemAdditionalInfoHTML"
        [selectedItemPreviewHTML]="selectedItemPreviewHTML"
        [columnDefs]="columnDefs"
        [allItems]="instruments"
        [filterItemFn]="filterItemFn"
        [isMonoSelection]="true"
      >
        <!-- Additional Info -->
        <ng-template #itemAdditionalInfoHTML let-instrument="item">
          <p class="text-sm text-neutral-700">
            {{ instrument.comment || 'dataEntry.dialogInstrumentSelector.additionalInfoNotAvailable' | translate }}
          </p>
        </ng-template>
        <!-- Selected Item Preview -->
        <ng-template #selectedItemPreviewHTML let-instrument="item">
          <div class="flex text-sm">
            <div class="w-16">{{ instrument.id }}</div>
            <div>{{ instrument.name }}</div>
          </div>
        </ng-template>
      </parteng-dialog-item-selector>
    </section>
  `,
})
export class DialogInstrumentSelectorSharedComponent implements OnInit {
  instruments: DisplayedInstrument[] = [];
  @ViewChild(DialogItemSelectorComponent) dialogItemSelectorComponent!: DialogItemSelectorComponent<Instrument2>;

  columnDefs: TableColumnDef[] = [
    { key: 'id', labelTranslateKey: 'dataEntry.dialogInstrumentSelector.columnId' },
    { key: 'name', labelTranslateKey: 'dataEntry.dialogInstrumentSelector.columnName' },
    {
      key: 'effectiveDate',
      labelTranslateKey: 'dataEntry.dialogInstrumentSelector.columnEffectiveDate',
      pipeName: 'date',
      pipeArgs: ['shortDate'],
    },
    { key: 'creationProjectName', labelTranslateKey: 'dataEntry.dialogInstrumentSelector.columnCreationProject' },
  ];

  constructor(
    private instrumentService: InstrumentService2,
    @Inject(MAT_DIALOG_DATA) public dialogParams: DialogInstrumentSelectorSharedParams
  ) {}

  async ngOnInit() {
    const instruments = await lastValueFrom(this.dialogParams.operation$ || this.instrumentService.getAll$());
    this.instruments = instruments.map((instrument) => {
      const lastVersion = (instrument.instrumentVersions || []).sort((b: any, a: any) => a.order - b.order)[0];
      return {
        ...instrument,
        effectiveDate: lastVersion.effectiveDate,
        creationProjectName: lastVersion.creationProject.longName,
      };
    }) as unknown as DisplayedInstrument[];
  }

  filterItemFn(item: Instrument2, filter: string) {
    return JsHelper.ObjPropsContainString(item, filter, ['id', 'name', 'comment']);
  }
}
