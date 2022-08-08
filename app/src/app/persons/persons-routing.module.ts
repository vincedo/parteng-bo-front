import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageReferentialPersonsListComponent } from './pages/page-referential-persons-list.component';

const routes: Routes = [
  {
    path: 'list',
    component: PageReferentialPersonsListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PersonsRoutingModule {}
