import { NgModule } from '@angular/core';

import { SharedModule } from '@app/shared/shared.module';

import { BackofficeRoutingModule } from './backoffice-routing.module';

import { PageBackofficeHomeComponent } from './pages/page-admin-home/page-backoffice-home.component';
import { HomepageBlockComponent } from './components/homepage-block/homepage-block.component';
import { HomepageSeparatorComponent } from './components/homepage-separator/homepage-separator.component';

@NgModule({
  imports: [BackofficeRoutingModule, SharedModule],
  declarations: [PageBackofficeHomeComponent, HomepageBlockComponent, HomepageSeparatorComponent],
})
export class BackofficeModule {}
