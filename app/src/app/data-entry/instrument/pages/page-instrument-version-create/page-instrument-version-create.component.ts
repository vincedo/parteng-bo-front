import { Component, Inject } from '@angular/core';
import { BaseComponent } from '@app/core/components';
import { Breadcrumb } from '@app/core/models';
import { TaskService } from '@app/core/services/task.service';
import { InstrumentVersion } from '@app/data-entry/models/instrument-version.model';
import { InstrumentVersionService } from '@app/data-entry/services/instrument-version.service';
import { lastValueFrom, Observable } from 'rxjs';
import {
  PageInstrumentVersionData,
  PAGE_INSTRUMENT_VERSION_DATA,
  PAGE_INSTRUMENT_VERSION_PROVIDERS,
} from '../instrument-version.provider';

@Component({
  selector: 'parteng-page-instrument-version-create',
  template: ` <section *ngIf="data$ | async as data" class="page-transfer-form w-[1240px] mx-auto py-6">
    <div class="mb-8">
      <parteng-data-entry-breadcrumb
        [project]="data.project!"
        [breadcrumb]="[
          {
            label: data.instrument.name,
            path: ['/', 'data-entry', 'projects', data.project?.id, 'instruments', data.instrument.id]
          },
          { label: 'dataEntry.pageInstrumentVersionCreate.title' | translate }
        ]"
      ></parteng-data-entry-breadcrumb>
    </div>

    <h1 class="ptg-page-title">
      <span class="prefix">Saisie</span>{{ 'dataEntry.pageInstrumentVersionCreate.title' | translate }}
    </h1>
    <parteng-instrument-version-form
      [isNew]="true"
      [project]="data.project"
      [instrument]="data.instrument"
      [attributeTypes]="data.attributeTypes"
      [persons]="data.persons"
      [instruments]="data.instruments"
      [repaymentTypes]="data.repaymentTypes"
      (formSubmitted)="onFormSubmitted($event, data)"
      (cancel)="onCancel(data)"
    ></parteng-instrument-version-form>
  </section>`,
  providers: [PAGE_INSTRUMENT_VERSION_PROVIDERS],
})
export class PageInstrumentVersionCreateComponent extends BaseComponent {
  breadcrumb!: Breadcrumb;

  constructor(
    @Inject(PAGE_INSTRUMENT_VERSION_DATA) public data$: Observable<PageInstrumentVersionData>,
    private instrumentVersionService: InstrumentVersionService,
    private taskService: TaskService
  ) {
    super();
  }

  async onFormSubmitted(instrumentVersion: InstrumentVersion, data: PageInstrumentVersionData) {
    await this.taskService.do(lastValueFrom(this.instrumentVersionService.addInstrumentVersion(instrumentVersion)));
    const destination = data.project
      ? ['data-entry', 'projects', data.project.id, 'instruments', data.instrument.id]
      : ['data-entry', 'projects', '0', 'instruments', data.instrument.id];
    this.router.navigate(destination);
  }

  onCancel(data: PageInstrumentVersionData) {
    const destination = data.project
      ? ['data-entry', 'projects', data.project.id, 'instruments', data.instrument.id]
      : ['data-entry', 'projects', '0', 'instruments', data.instrument.id];
    this.router.navigate(destination);
  }
}
