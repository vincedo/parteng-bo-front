import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { Goal } from '@app/project/models';

@Component({
  selector: 'parteng-goal-list-checkboxes',
  templateUrl: './goal-list-checkboxes.component.html',
  styleUrls: ['./goal-list-checkboxes.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalListCheckboxesComponent {
  @Input() allGoals!: Goal[];
  @Input() selectedGoals!: Goal[];

  @Output() selectedGoalsChanged = new EventEmitter<void>();
  @Output() selectedGoalsSubmitted = new EventEmitter<Goal[]>();

  isDirty = false;

  get noSelectedGoals(): boolean {
    return this.selectedGoals?.length === 0;
  }

  toggleCheckbox(ev: MatCheckboxChange): void {
    const goalId = Number(ev.source.value);
    const goal = this.allGoals.find((g) => g.id === goalId)!;
    this.toggleGoal(goal);
  }

  // Public in case we want to call it from template (when user doesn't click on checkbox directly)
  toggleGoal(goal: Goal): void {
    if (this.isSelected(goal)) {
      this.selectedGoals = this.selectedGoals.filter((g) => g.id !== goal.id);
    } else {
      this.selectedGoals = [...this.selectedGoals, goal];
    }
    this.isDirty = true;
    this.selectedGoalsChanged.emit();
  }

  isSelected(goal: Goal): boolean {
    return this.selectedGoals.some((g) => g.id === goal.id);
  }

  submitSelectedGoals(): void {
    this.selectedGoalsSubmitted.emit(this.selectedGoals);
  }
}
