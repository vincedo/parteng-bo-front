import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { BaseComponent } from '@app/core/components';
import { Breadcrumb } from '@app/core/models';
import { TaskService } from '@app/core/services/task.service';
import { InstrumentVersion } from '@app/data-entry/models/instrument-version.model';
import { InstrumentVersionService } from '@app/data-entry/services/instrument-version.service';
import { GenericDialogService } from '@app/shared/components/generic-dialog/generic-dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom, Observable } from 'rxjs';
import {
  PageInstrumentVersionData,
  PAGE_INSTRUMENT_VERSION_DATA,
  PAGE_INSTRUMENT_VERSION_PROVIDERS,
} from '../instrument-version.provider';

@Component({
  selector: 'parteng-page-instrument-version-update',
  template: `
    <section class="w-[1240px] mx-auto py-6" *ngIf="data$ | async as data">
      <div class="mb-8">
        <parteng-data-entry-breadcrumb
          *ngIf="data.project"
          [project]="data.project!"
          [breadcrumb]="[
            {
              label: 'dataEntry.pageInstrumentUpdate.title' | translate: { instrumentName: data.instrument.name },
              path: ['/', 'data-entry', 'projects', data.project?.id, 'instruments', data.instrument.id]
            },

            {
              label: title(data)
            }
          ]"
        ></parteng-data-entry-breadcrumb>
        <!-- If coming from referential -->
        <parteng-breadcrumb
          *ngIf="!data.project"
          [breadcrumb]="[
            { label: 'instruments.featureName' | translate, path: ['/', 'instruments', 'list'] },
            {
              label: 'dataEntry.pageInstrumentUpdate.title' | translate: { instrumentName: data.instrument.name },
              path: ['/', 'data-entry', 'projects', '0', 'instruments', data.instrument.id]
            },
            {
              label: title(data)
            }
          ]"
        ></parteng-breadcrumb>
      </div>

      <h1 class="ptg-page-title">
        <span class="prefix">{{
          (data.project ? 'dataEntry.featureName' : 'instruments.referential') | translate
        }}</span
        >{{ fullTitle(data) }}
      </h1>
      <parteng-instrument-version-form
        [isNew]="false"
        [project]="data.project!"
        [instrument]="data.instrument!"
        [instrumentVersion]="data.instrumentVersion"
        [attributeTypes]="data.attributeTypes"
        [persons]="data.persons"
        [instruments]="data.instruments"
        [repaymentTypes]="data.repaymentTypes"
        [readonly]="data.readonly"
        (deleteVersion)="onDeleteInstrumentVersion(data)"
        (formSubmitted)="onFormSubmitted($event, data)"
        (cancel)="goBack(data)"
      ></parteng-instrument-version-form>
    </section>
  `,
  providers: [PAGE_INSTRUMENT_VERSION_PROVIDERS],
})
export class PageInstrumentVersionUpdateComponent extends BaseComponent {
  breadcrumb!: Breadcrumb;

  constructor(
    @Inject(PAGE_INSTRUMENT_VERSION_DATA) public data$: Observable<PageInstrumentVersionData>,
    private instrumentVersionService: InstrumentVersionService,
    private taskService: TaskService,
    private genericDialogService: GenericDialogService,
    private translateService: TranslateService,
    private datePipe: DatePipe
  ) {
    super();
  }

  title(data: PageInstrumentVersionData): string {
    return this.translateService.instant('dataEntry.pageInstrumentVersionUpdate.title', {
      effectiveDate: this.datePipe.transform(data.instrumentVersion.effectiveDate, 'shortDate'),
      versionOrder: data.instrumentVersion.order,
    });
  }

  fullTitle(data: PageInstrumentVersionData): string {
    return this.translateService.instant('dataEntry.pageInstrumentVersionUpdate.fullTitle', {
      instrumentName: data.instrument?.name,
      effectiveDate: this.datePipe.transform(data.instrumentVersion.effectiveDate, 'shortDate'),
      versionOrder: data.instrumentVersion.order,
    });
  }

  async onDeleteInstrumentVersion(data: PageInstrumentVersionData) {
    const confirm = await lastValueFrom(
      this.genericDialogService.binary(
        this.translateService.instant('dataEntry.instrumentVersionForm.deleteTitle'),
        this.translateService.instant('dataEntry.instrumentVersionForm.deleteDescription', {
          versionOrder: data.instrumentVersion.order,
          instrumentName: data.instrument.name,
        }),
        this.translateService.instant('dataEntry.instrumentVersionForm.deleteYes'),
        this.translateService.instant('dataEntry.instrumentVersionForm.deleteNo')
      )
    );
    if (!confirm) {
      return;
    }
    await this.taskService.do(
      lastValueFrom(this.instrumentVersionService.deleteInstrumentVersion(data.instrumentVersion))
    );
    this.goBack(data);
  }

  async onFormSubmitted(instrumentVersion: InstrumentVersion, data: PageInstrumentVersionData) {
    await this.taskService.do(lastValueFrom(this.instrumentVersionService.updateInstrumentVersion(instrumentVersion)));
    this.goBack(data);
  }

  goBack(data: PageInstrumentVersionData) {
    const destination = data.project
      ? ['data-entry', 'projects', data.project.id, 'instruments', data.instrument.id]
      : ['data-entry', 'projects', '0', 'instruments', data.instrument.id];
    this.router.navigate(destination, { queryParams: { readonly: data.readonly } });
  }
}
