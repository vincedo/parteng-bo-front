import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CanLeaveDirtyFormPageGuard } from '@app/core/services';

// Components
import { PageProjectsListComponent } from './pages/page-projects-list/page-projects-list.component';
import { PageProjectFormComponent } from './pages/page-project-form/page-project-form.component';
import { PermissionKey, ResourceKey } from '@core/models/authorization.model';
import { AuthorizedGuard } from '@core/guards/authorized.guard';

const routes: Routes = [
  // { path: '', redirectTo: 'update/178', pathMatch: 'full' },
  { path: '', redirectTo: 'create', pathMatch: 'full' },
  {
    path: 'list',
    component: PageProjectsListComponent,
    // canActivate: [AuthorizedGuard],
    data: {
      permissionKey: 'read' as PermissionKey,
      resourceKey: 'projects' as ResourceKey,
    },
  },
  {
    path: 'create',
    component: PageProjectFormComponent,
    canDeactivate: [CanLeaveDirtyFormPageGuard],
    // canActivate: [AuthorizedGuard],
    data: {
      permissionKey: 'create' as PermissionKey,
      resourceKey: 'projects' as ResourceKey,
    },
  },
  {
    path: 'update/:id',
    component: PageProjectFormComponent,
    canDeactivate: [CanLeaveDirtyFormPageGuard],
    // canActivate: [AuthorizedGuard],
    data: {
      permissionKey: 'read' as PermissionKey,
      resourceKey: 'projects' as ResourceKey,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ProjectRoutingModule {}
