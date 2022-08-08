import { NgModule } from '@angular/core';
import { SharedModule } from '@app/shared/shared.module';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { DataEntryDashboardSideMenuComponent } from './dashboard/components/data-entry-dashboard-side-menu/data-entry-dashboard-side-menu.component';
// Dashboard
import { PageDataEntryDashboardComponent } from './dashboard/pages/page-data-entry-dashboard/page-data-entry-dashboard.component';
import { DashboardEffects } from './dashboard/store/dashboard.effects';
import { DataEntryBreadcrumbComponent } from './data-entry-breadcrumb.component';
import { DataEntryRoutingModule } from './data-entry-routing.module';
import { AttributeSelectionableControlComponent } from './instrument/components/attributes-controls/attribute-selectionable-control.component';
import { AttributesControlsComponent } from './instrument/components/attributes-controls/attributes-controls.component';
import { InstrumentFormBlockComponent } from './instrument/components/instrument-form-block/instrument-form-block.component';
import { InstrumentFormComponent } from './instrument/components/instrument-form/instrument-form.component';
import { InstrumentVersionFormComponent } from './instrument/components/instrument-version-form/instrument-version-form.component';
import { InstrumentVersionsTableComponent } from './instrument/components/instrument-versions-table/instrument-versions-table.component';
import { InstrumentsListTableComponent } from './instrument/components/instruments-list-table/instruments-list-table.component';
import { InstrumentsListComponent } from './instrument/components/instruments-list/instruments-list.component';
import { PageInstrumentCreateComponent } from './instrument/pages/page-instrument-create/page-instrument-create.component';
import { PageInstrumentUpdateComponent } from './instrument/pages/page-instrument-update/page-instrument-update.component';
import { PageInstrumentVersionCreateComponent } from './instrument/pages/page-instrument-version-create/page-instrument-version-create.component';
import { PageInstrumentVersionUpdateComponent } from './instrument/pages/page-instrument-version-update/page-instrument-version-update.component';
import { PageInstrumentsListComponent } from './instrument/pages/page-instruments-list/page-instruments-list.component';
import { PagePersonsListComponent } from './persons/pages/page-persons-list/page-persons-list.component';
// import { InstrumentEffects } from './instrument/store/instrument.effects';
import { dataEntryModuleReducers, featureKey } from './store';
import { TransferFormBlockComponent } from './transfer/components/transfer-form-block/transfer-form-block.component';
import { TransferFormComponent } from './transfer/components/transfer-form/transfer-form.component';
import { TransferInstrumentFieldComponent } from './transfer/components/transfer-instrument-field/transfer-instrument-field.component';
import { TransferPersonFieldComponent } from './transfer/components/transfer-person-field/transfer-person-field.component';
import { TransferQtyAmountFieldComponent } from './transfer/components/transfer-qty-amount-field/transfer-qty-amount-field.component';
import { TransfersListFiltersComponent } from './transfer/components/transfers-list-filters/transfers-list-filters.component';
import { TransfersListTableComponent } from './transfer/components/transfers-list-table/transfers-list-table.component';
import { TransfersListComponent } from './transfer/components/transfers-list/transfers-list.component';
// Transfer
import { PageTransferFormComponent } from './transfer/pages/page-transfer-form/page-transfer-form.component';
import { PageTransfersListComponent } from './transfer/pages/page-transfers-list/page-transfers-list.component';
import { TransferEffects } from './transfer/store/transfer.effects';

@NgModule({
  imports: [
    DataEntryRoutingModule,
    SharedModule,
    StoreModule.forFeature(featureKey, dataEntryModuleReducers),
    EffectsModule.forFeature([DashboardEffects, TransferEffects /* InstrumentEffects*/]),
  ],
  declarations: [
    DataEntryBreadcrumbComponent,
    PageDataEntryDashboardComponent,
    DataEntryDashboardSideMenuComponent,
    PageTransferFormComponent,
    TransferFormComponent,
    TransferFormBlockComponent,
    TransferInstrumentFieldComponent,
    TransferPersonFieldComponent,
    TransferQtyAmountFieldComponent,
    PageTransfersListComponent,
    TransfersListComponent,
    TransfersListFiltersComponent,
    TransfersListTableComponent,
    PageInstrumentCreateComponent,
    InstrumentFormComponent,
    InstrumentFormBlockComponent,
    PagePersonsListComponent,
    InstrumentsListComponent,
    InstrumentsListTableComponent,
    PageInstrumentsListComponent,
    PageInstrumentUpdateComponent,
    InstrumentVersionsTableComponent,
    PageInstrumentVersionCreateComponent,
    InstrumentVersionFormComponent,
    AttributesControlsComponent,
    AttributeSelectionableControlComponent,
    PageInstrumentVersionUpdateComponent,
  ],
  exports: [InstrumentsListComponent],
})
export class DataEntryModule {}
