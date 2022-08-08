import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { BaseComponent } from '@app/core/components';
import { Instrument2 } from '@app/data-entry/models/instrument.model';
import { Observable } from 'rxjs';
import {
  PageInstrumentsListData,
  PAGE_INSTRUMENTS_LIST_DATA,
  PAGE_INSTRUMENTS_LIST_PROVIDERS,
} from '../instruments-list.provider';

@Component({
  selector: 'parteng-page-instruments-list',
  template: `
    <div *ngIf="data$ | async as data" class="page-instruments-list w-full h-full mx-auto">
      <!-- Page Header -->
      <div class="page-header">
        <parteng-page-title
          [title]="
            ('dataEntry.pageInstrumentsList.title' | translate) +
            ('dataEntry.pageInstrumentsList.folders.' + data.folderName | translate)
          "
        ></parteng-page-title>
        <h1 class="ptg-page-title-blueline">
          {{ 'dataEntry.pageInstrumentsList.folders.' + data.folderName | translate }}
        </h1>
        <div [innerHTML]="'dataEntry.pageInstrumentsList.description' | translate" class="mt-2 mb-4"></div>
      </div>

      <div class="h-[680px]">
        <parteng-instruments-list
          *ngIf="data.instruments && data.instruments.length > 0; else noInstrument"
          [instruments]="data.instruments"
          (instrumentSelected)="onInstrumentSelected($event)"
        ></parteng-instruments-list>
        <ng-template #noInstrument>
          <div class="mt-5 text-lg font-light">
            {{
              'dataEntry.pageInstrumentsList.noInstrument.' + data.folderName
                | translate: { projectName: data.project.longName }
            }}
          </div>
        </ng-template>
      </div>

      <div class="page-footer flex items-center justify-end mt-4">
        <div>
          <button
            type="button"
            mat-raised-button
            color="primary"
            (click)="gotoSelectedInstrument(data)"
            [disabled]="!selectedInstrument"
            parteng-requires-permission="read"
            parteng-requires-resource="instruments"
            data-testId="show-selected-instrument-button"
          >
            {{ 'dataEntry.pageInstrumentsList.footer.viewBtn' | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  providers: PAGE_INSTRUMENTS_LIST_PROVIDERS,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageInstrumentsListComponent extends BaseComponent {
  selectedInstrument!: Instrument2;

  constructor(@Inject(PAGE_INSTRUMENTS_LIST_DATA) public data$: Observable<PageInstrumentsListData>) {
    super();
  }

  onInstrumentSelected(instrument: Instrument2) {
    this.selectedInstrument = instrument;
  }

  gotoSelectedInstrument(data: PageInstrumentsListData) {
    this.router.navigate(['data-entry', 'projects', data.project.id, 'instruments', this.selectedInstrument.id]);
  }
}
