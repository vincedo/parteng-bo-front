import { Component, Inject, ViewChild } from '@angular/core';
import { BaseComponent } from '@app/core/components';
import { Breadcrumb } from '@app/core/models';
import { TaskService } from '@app/core/services/task.service';
import { InstrumentType, PSEUDO_FOLDER } from '@app/data-entry/models';
import { AttributeType } from '@app/data-entry/models/attribute-type.model';
import { Instrument2 } from '@app/data-entry/models/instrument.model';
import { AttributeTypeService } from '@app/data-entry/services/attribute-type.service';
import { InstrumentService2 } from '@app/data-entry/services/instrument2.service';
import { firstValueFrom, lastValueFrom, Observable } from 'rxjs';
import { InstrumentFormComponent } from '../../components/instrument-form/instrument-form.component';
import {
  PageInstrumentCreateData,
  PAGE_INSTRUMENT_CREATE_DATA,
  PAGE_INSTRUMENT_CREATE_PROVIDERS,
} from '../instrument-create.provider';

@Component({
  selector: 'parteng-page-instrument-create',
  template: `
    <section *ngIf="data$ | async as data" class="page-transfer-form w-[1240px] mx-auto py-6">
      <div class="mb-8">
        <parteng-data-entry-breadcrumb
          [project]="data.project!"
          [breadcrumb]="[{ label: 'dataEntry.pageInstrumentForm.titleNewInstrument' | translate }]"
        ></parteng-data-entry-breadcrumb>
      </div>

      <h1 class="ptg-page-title">
        <span class="prefix">Saisie</span>{{ 'dataEntry.pageInstrumentForm.titleNewInstrument' | translate }}
      </h1>
      <parteng-instrument-form
        [isNew]="true"
        [project]="data.project"
        [instrumentTypes]="data.instrumentTypes"
        [persons]="data.persons"
        [repaymentTypes]="data.repaymentTypes"
        (instrumentTypeSelected)="onInstrumentTypeSelected($event)"
        [attributeTypes]="attributeTypes"
        (cancel)="onCancel(data)"
        (formSubmitted)="onFormSubmitted($event, data)"
      ></parteng-instrument-form>
    </section>
  `,
  providers: PAGE_INSTRUMENT_CREATE_PROVIDERS,
})
export class PageInstrumentCreateComponent extends BaseComponent {
  breadcrumb!: Breadcrumb;
  attributeTypes: AttributeType[] = [];
  safeLeave = true; // If true, warn user when they try to leave on a dirty form

  @ViewChild(InstrumentFormComponent) formComponent!: InstrumentFormComponent;

  constructor(
    @Inject(PAGE_INSTRUMENT_CREATE_DATA) public data$: Observable<PageInstrumentCreateData>,
    private attributeTypeService: AttributeTypeService,
    private instrumentService2: InstrumentService2,
    private taskService: TaskService
  ) {
    super();
  }

  async onInstrumentTypeSelected(instrumentType: InstrumentType) {
    this.attributeTypes = await lastValueFrom(this.attributeTypeService.getByInstrumentType$(instrumentType.id));
  }

  async onFormSubmitted(instrument: Instrument2, data: PageInstrumentCreateData) {
    await this.taskService.do(firstValueFrom(this.instrumentService2.saveInstrument(instrument)));
    this.router.navigate([
      'data-entry',
      'projects',
      data.project.id,
      'folders',
      PSEUDO_FOLDER.UPDATED_INSTRUMENTS,
      'instruments',
      'list',
    ]);
  }

  onCancel(data: PageInstrumentCreateData) {
    this.router.navigate(['data-entry', 'projects', data.project.id]);
  }
}
