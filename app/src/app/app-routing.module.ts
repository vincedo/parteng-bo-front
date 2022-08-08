import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { AuthComponent } from './auth.component';
import { LoginComponent } from './login.component';
import { LogoutComponent } from './logout.component';
import { AuthorizedGuard } from '@core/guards/authorized.guard';

const routes: Routes = [
  { path: '', redirectTo: 'backoffice', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'logout', component: LogoutComponent },
  { path: 'oauth2', component: AuthComponent },
  { path: 'backoffice', loadChildren: () => import('./backoffice/backoffice.module').then((m) => m.BackofficeModule) },
  {
    path: 'projects',
    // canActivate: [AuthorizedGuard],
    data: {
      permissionKey: 'read',
      resourceKey: 'projects',
    },
    loadChildren: () => import('./project/project.module').then((m) => m.ProjectModule),
  },
  {
    path: 'data-entry',
    loadChildren: () => import('./data-entry/data-entry.module').then((m) => m.DataEntryModule),
  },
  {
    path: 'instruments',
    loadChildren: () => import('./instruments/instruments.module').then((m) => m.InstrumentsModule),
  },
  {
    path: 'persons',
    loadChildren: () => import('./persons/persons.module').then((m) => m.PersonsModule),
  },
  {
    path: 'scopes',
    loadChildren: () => import('./scopes/scopes.module').then((m) => m.ScopesModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
      paramsInheritanceStrategy: 'always',
      enableTracing: false,
      anchorScrolling: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
