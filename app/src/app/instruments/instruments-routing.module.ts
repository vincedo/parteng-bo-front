import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageReferentialInstrumentsListComponent } from './pages/page-referential-instruments-list.component';

const routes: Routes = [
  {
    path: 'list',
    component: PageReferentialInstrumentsListComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InstrumentsRoutingModule {}
