import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PageBackofficeHomeComponent } from './pages/page-admin-home/page-backoffice-home.component';

const routes: Routes = [{ path: '', component: PageBackofficeHomeComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BackofficeRoutingModule {}
