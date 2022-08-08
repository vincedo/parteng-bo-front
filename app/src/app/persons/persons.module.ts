import { NgModule } from '@angular/core';
import { DataEntryModule } from '@app/data-entry/data-entry.module';
import { SharedModule } from '@app/shared/shared.module';
import { PersonsRoutingModule } from './persons-routing.module';
import { PageReferentialPersonsListComponent } from './pages/page-referential-persons-list.component';

@NgModule({
  imports: [PersonsRoutingModule, SharedModule, DataEntryModule],
  declarations: [PageReferentialPersonsListComponent],
})
export class PersonsModule {}
