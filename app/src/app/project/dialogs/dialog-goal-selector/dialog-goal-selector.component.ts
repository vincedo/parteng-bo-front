import { Component, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { AbstractDialogComponent } from '@app/core/components';
import { Goal } from '@app/project/models';
import * as projectFormSelectors from '@app/project/store/project-form.selectors';

export type DialogGoalSelectorResult = { goals: Goal[]; selectedGoalsChanged: boolean };

@Component({
  selector: 'parteng-dialog-goal-selector',
  templateUrl: './dialog-goal-selector.component.html',
  styleUrls: ['./dialog-goal-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogGoalSelectorComponent extends AbstractDialogComponent<DialogGoalSelectorResult> {
  state$ = this.store.select(projectFormSelectors.selectDialogGoalSelectorState);

  constructor(dialogRef: MatDialogRef<DialogGoalSelectorComponent, DialogGoalSelectorResult>) {
    super(dialogRef);
  }

  onSelectedGoalsChanged(): void {
    this.markAsDirty();
  }

  submitSelectedGoals(goals: Goal[]): void {
    this.submitAndCloseDialog({ goals, selectedGoalsChanged: this.isDirty });
  }
}
