import { NgModule } from '@angular/core';

import { DataEntryModule } from '@app/data-entry/data-entry.module';
import { SharedModule } from '@app/shared/shared.module';
import { ScopesRoutingModule } from './scopes-routing.module';

import { PageReferentialScopesListComponent } from './pages/page-referential-scopes-list.component';

@NgModule({
  imports: [ScopesRoutingModule, SharedModule, DataEntryModule],
  declarations: [PageReferentialScopesListComponent],
})
export class ScopesModule {}
