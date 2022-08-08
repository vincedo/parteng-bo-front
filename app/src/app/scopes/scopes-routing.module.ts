import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PageReferentialScopesListComponent } from './pages/page-referential-scopes-list.component';
import { AuthorizedGuard } from '@core/guards/authorized.guard';
import { PermissionKey, ResourceKey } from '@core/models/authorization.model';

const routes: Routes = [
  {
    path: 'list',
    component: PageReferentialScopesListComponent,
    canActivate: [AuthorizedGuard],
    data: {
      permissionKey: 'read',
      resourceKey: 'scopes',
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ScopesRoutingModule {}
