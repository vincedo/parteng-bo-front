import { Component, Inject } from '@angular/core';
import { BaseComponent } from '@app/core/components';
import { Instrument2 } from '@app/data-entry/models/instrument.model';
import { Observable } from 'rxjs';
import {
  PageReferentialInstrumentsListData,
  PAGE_REFERENTIAL_INSTRUMENTS_LIST_DATA,
  PAGE_REFERENTIAL_INSTRUMENTS_LIST_PROVIDERS,
} from './page-referential-instruments-list.provider';

@Component({
  selector: 'parteng-page-referential-instruments-list',
  template: `
    <section *ngIf="data$ | async as data" class="page-referential-instruments-list w-[1240px] h-full mx-auto">
      <!-- Header -->
      <div class="page-header">
        <div class="my-4">
          <parteng-page-title
            [title]="'instruments.pageInstrumentsList.breadcrumbTitle' | translate"
          ></parteng-page-title>
          <parteng-breadcrumb
            [breadcrumb]="[{ label: 'instruments.pageInstrumentsList.breadcrumbTitle' | translate }]"
          ></parteng-breadcrumb>
        </div>

        <div class="flex justify-between">
          <div class="flex-auto">
            <h1 class="text-lg font-semibold pl-4 border-l-[3px] border-blue-ptg-primary-800">
              {{ 'instruments.pageInstrumentsList.title' | translate }}
            </h1>
            <div [innerHTML]="'instruments.pageInstrumentsList.description' | translate"></div>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="h-[680px] mt-5">
        <parteng-instruments-list
          [instruments]="data.instruments"
          (instrumentSelected)="selectedInstrument = $event"
        ></parteng-instruments-list>
      </div>

      <!-- Footer -->
      <div class="page-footer flex items-center justify-end mt-3">
        <div>
          <button
            type="button"
            mat-raised-button
            color="primary"
            (click)="goToInstrument()"
            [disabled]="!selectedInstrument"
            parteng-requires-permission="read"
            parteng-requires-resource="instruments"
            data-testId="show-selected-instrument-button"
          >
            {{ 'project.pageProjectsList.footer.viewBtn' | translate }}
          </button>
        </div>
      </div>
    </section>
  `,
  providers: PAGE_REFERENTIAL_INSTRUMENTS_LIST_PROVIDERS,
})
export class PageReferentialInstrumentsListComponent extends BaseComponent {
  selectedInstrument: Instrument2 | undefined;

  constructor(
    @Inject(PAGE_REFERENTIAL_INSTRUMENTS_LIST_DATA) public data$: Observable<PageReferentialInstrumentsListData>
  ) {
    super();
  }

  goToInstrument() {
    this.router.navigate(['data-entry', 'projects', 0, 'instruments', this.selectedInstrument!.id]);
  }
}
