import { Component, ChangeDetectionStrategy, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { AbstractFormDialogComponent } from '@app/core/components';
import { RelProjectToGoal } from '@app/project/models/rel-project-to-goal';
import { GoalEnricherFormComponent } from '@app/project/forms/goal-enricher-form/goal-enricher-form.component';

export type DialogGoalEnricherResult = RelProjectToGoal;

export interface DialogGoalEnricherData {
  relProjectToGoal: RelProjectToGoal;
}

@Component({
  selector: 'parteng-dialog-goal-enricher',
  templateUrl: './dialog-goal-enricher.component.html',
  styleUrls: ['./dialog-goal-enricher.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogGoalEnricherComponent extends AbstractFormDialogComponent<RelProjectToGoal> {
  @ViewChild(GoalEnricherFormComponent) formComponent!: GoalEnricherFormComponent;

  relProjectToGoal!: RelProjectToGoal;
  formState$!: Observable<any>; // @TODO: Remove

  constructor(
    dialogRef: MatDialogRef<DialogGoalEnricherComponent, DialogGoalEnricherResult>,
    @Inject(MAT_DIALOG_DATA) dialogData: DialogGoalEnricherData
  ) {
    super(dialogRef);
    this.relProjectToGoal = dialogData.relProjectToGoal;
  }

  onGoalPersonsChanged(): void {
    this.markAsDirty();
  }

  onFormSubmitted(relProjectToGoal: RelProjectToGoal): void {
    this._forceDialogClose(relProjectToGoal); // do not use "safe close"
  }
}
