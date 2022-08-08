import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Breadcrumb } from '@app/core/models';
import {
  DialogProjectSelectorComponent,
  DialogProjectSelectorComponentResult,
} from '@app/project/dialogs/dialog-project-selector/dialog-project-selector.component';
import { Project } from '@app/project/models';
import { DIALOG_WIDTH_LARGE } from '@app/shared/shared.constants';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'parteng-data-entry-breadcrumb',
  template: `
    <parteng-breadcrumb *ngIf="dataEntryBreadcrumb" [breadcrumb]="dataEntryBreadcrumb"></parteng-breadcrumb>
  `,
})
export class DataEntryBreadcrumbComponent {
  @Input() project: Project | undefined | null;
  @Input() breadcrumb: Breadcrumb = [];

  dataEntryBreadcrumb: Breadcrumb = [];

  constructor(private dialog: MatDialog, private translateService: TranslateService) {}

  ngOnChanges() {
    this.dataEntryBreadcrumb = [
      {
        label: this.translateService.instant('dataEntry.pageTransferForm.breadcrumbDataEntry'),
        clickFn: this.getOpenProjectSelectorFn(),
      },
      {
        label: this.translateService.instant('dataEntry.pageTransferForm.breadcrumbProject', {
          projectName: this.project?.longName || '',
        }),
        path: this.breadcrumb && this.breadcrumb.length > 0 ? ['/data-entry/projects', this.project?.id] : undefined,
      },
      ...this.breadcrumb,
    ];
  }

  getOpenProjectSelectorFn(): () => void {
    return () => this.openProjectSelector();
  }

  private openProjectSelector(): void {
    this.dialog.open<DialogProjectSelectorComponent, undefined, DialogProjectSelectorComponentResult>(
      DialogProjectSelectorComponent,
      { width: DIALOG_WIDTH_LARGE, height: '90%' }
    );
  }
}
