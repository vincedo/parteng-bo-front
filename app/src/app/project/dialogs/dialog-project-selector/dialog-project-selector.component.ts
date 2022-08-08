import { Component, ChangeDetectionStrategy, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { AbstractDialogComponent } from '@app/core/components';
import { Project } from '@app/project/models';
import { VALIDATION_STATUS } from '@app/shared/models';

import * as projectFormActions from '@app/project/store/project-form.actions';
import * as projectFormSelectors from '@app/project/store/project-form.selectors';

export type DialogProjectSelectorComponentResult = null;

@Component({
  selector: 'parteng-dialog-project-selector',
  templateUrl: './dialog-project-selector.component.html',
  styleUrls: ['./dialog-project-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class DialogProjectSelectorComponent
  extends AbstractDialogComponent<DialogProjectSelectorComponentResult>
  implements OnInit
{
  dialogHeaderHeight = 130;
  dialogButtonsHeight = 60;
  defaultStatusFilter: VALIDATION_STATUS = VALIDATION_STATUS.NOT_REVIEWED;
  projectsListState$ = this.store.select(projectFormSelectors.selectProjectsListState);

  constructor(dialogRef: MatDialogRef<DialogProjectSelectorComponent, DialogProjectSelectorComponentResult>) {
    super(dialogRef);
  }

  ngOnInit(): void {
    this.store.dispatch(projectFormActions.loadProjectsList());
  }

  // @TODO: See refactoring in PageProjectsListComponent
  onProjectClicked(project?: Project): void {
    if (project) {
      this.markAsDirty();
      this.store.dispatch(projectFormActions.loadProjectHighlightedInProjectsList({ projectId: project?.id }));
    } else {
      this.store.dispatch(projectFormActions.resetProjectHighlightedInProjectsList());
    }
  }

  gotoSelectedProject(project?: Project): void {
    if (project) {
      this.store.dispatch(projectFormActions.selectProjectForDataEntry({ project }));
      this.closeDialog();
    }
  }
}
