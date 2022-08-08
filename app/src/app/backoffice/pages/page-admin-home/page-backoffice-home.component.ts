import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { BaseComponent } from '@app/core/components';
import {
  DialogProjectSelectorComponent,
  DialogProjectSelectorComponentResult,
} from '@app/project/dialogs/dialog-project-selector/dialog-project-selector.component';
import { DIALOG_WIDTH_LARGE } from '@app/shared/shared.constants';
// import { DIALOG_WIDTH_LARGE } from '@app/shared/shared.constants';

@Component({
  selector: 'parteng-page-backoffice-home',
  templateUrl: './page-backoffice-home.component.html',
  styleUrls: ['./page-backoffice-home.component.scss'],
})
export class PageBackofficeHomeComponent extends BaseComponent {
  constructor(private dialog: MatDialog) {
    super();
  }

  openProjectSelector(): void {
    this.dialog.open<DialogProjectSelectorComponent, undefined, DialogProjectSelectorComponentResult>(
      DialogProjectSelectorComponent,
      { width: DIALOG_WIDTH_LARGE, height: '90%' }
    );
  }

  gotoProjectRepository(): void {
    this.router.navigate(['/projects/list']);
  }

  goToInstrumentsReferential() {
    this.router.navigate(['/instruments/list']);
  }

  goToPersonsReferential() {
    this.router.navigate(['/persons/list']);
  }

  goToScopesReferential() {
    this.router.navigate(['/scopes/list']);
  }
}
