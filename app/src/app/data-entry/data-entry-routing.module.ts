import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CanLeaveDirtyFormPageGuard } from '@app/core/services';
import { PageDataEntryDashboardComponent } from './dashboard/pages/page-data-entry-dashboard/page-data-entry-dashboard.component';
import { PageInstrumentCreateComponent } from './instrument/pages/page-instrument-create/page-instrument-create.component';
import { PageInstrumentUpdateComponent } from './instrument/pages/page-instrument-update/page-instrument-update.component';
import { PageInstrumentVersionCreateComponent } from './instrument/pages/page-instrument-version-create/page-instrument-version-create.component';
import { PageInstrumentVersionUpdateComponent } from './instrument/pages/page-instrument-version-update/page-instrument-version-update.component';
import { PageInstrumentsListComponent } from './instrument/pages/page-instruments-list/page-instruments-list.component';
import { PagePersonsListComponent } from './persons/pages/page-persons-list/page-persons-list.component';
import { PageTransferFormComponent } from './transfer/pages/page-transfer-form/page-transfer-form.component';
import { PageTransfersListComponent } from './transfer/pages/page-transfers-list/page-transfers-list.component';

const routes: Routes = [
  {
    path: 'projects/:projectId',
    children: [
      { path: '', redirectTo: 'folders/ALL_FOLDERS/transfers/list', pathMatch: 'full' },

      // ---------- Instruments

      {
        path: 'instruments/create',
        component: PageInstrumentCreateComponent,
        // canDeactivate: [CanLeaveDirtyFormPageGuard],
      },

      {
        path: 'instruments/:instrumentId',
        component: PageInstrumentUpdateComponent,
      },

      {
        path: 'instruments/:instrumentId/versions/create',
        component: PageInstrumentVersionCreateComponent,
      },

      {
        path: 'instruments/:instrumentId/versions/:instrumentVersionId/update',
        component: PageInstrumentVersionUpdateComponent,
      },

      // ---------- Folders

      {
        path: 'folders/:folderId',
        component: PageDataEntryDashboardComponent,
        children: [
          {
            path: 'persons/list',
            component: PagePersonsListComponent,
          },

          {
            path: 'instruments/list',
            component: PageInstrumentsListComponent,
          },
          {
            path: 'transfers/list',
            component: PageTransfersListComponent,
          },
        ],
      },
      {
        path: 'folders/:folderId/transfers/create',
        component: PageTransferFormComponent,
        canDeactivate: [CanLeaveDirtyFormPageGuard],
        data: {
          dialogLeaveWarningTextTranslateKey: 'dataEntry.pageTransferForm.dialogLeaveWarningText',
        },
      },
      {
        path: 'folders/:folderId/transfers/:transferId/update',
        component: PageTransferFormComponent,
        canDeactivate: [CanLeaveDirtyFormPageGuard],
        data: {
          dialogLeaveWarningTextTranslateKey: 'dataEntry.pageTransferForm.dialogLeaveWarningText',
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DataEntryRoutingModule {}
