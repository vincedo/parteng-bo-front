import { NgModule } from '@angular/core';
import { DataEntryModule } from '@app/data-entry/data-entry.module';
import { SharedModule } from '@app/shared/shared.module';
import { InstrumentsRoutingModule } from './instruments-routing.module';
import { PageReferentialInstrumentsListComponent } from './pages/page-referential-instruments-list.component';

@NgModule({
  imports: [InstrumentsRoutingModule, SharedModule, DataEntryModule],
  declarations: [PageReferentialInstrumentsListComponent],
})
export class InstrumentsModule {}
