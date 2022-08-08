import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

import { AbstractFormComponent } from '@app/core/components';
import { Person } from '@app/project/models';
import { RelProjectToGoal } from '@app/project/models/rel-project-to-goal';

@Component({
  selector: 'parteng-goal-enricher-form',
  templateUrl: './goal-enricher-form.component.html',
  styleUrls: ['./goal-enricher-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoalEnricherFormComponent extends AbstractFormComponent<RelProjectToGoal> {
  @Input() relProjectToGoal!: RelProjectToGoal;

  @Output() personsChanged = new EventEmitter<void>();

  buildForm(): void {
    this.form = this.fb.group({
      persons: [this.relProjectToGoal.persons],
      comment: [this.relProjectToGoal.comment],
    });
  }

  serializeForm(): RelProjectToGoal {
    const formData = this.form!.value;

    const relProjectToGoal = new RelProjectToGoal();
    relProjectToGoal.projects_id = this.relProjectToGoal.projects_id;
    relProjectToGoal.goals_id = this.relProjectToGoal.goals_id;
    relProjectToGoal.goal = this.relProjectToGoal.goal;
    relProjectToGoal.status = this.relProjectToGoal.status;
    relProjectToGoal.persons = formData.persons;
    relProjectToGoal.comment = formData.comment;

    return relProjectToGoal;
  }

  onPersonsChanged(persons: Person[]): void {
    this.form.get('persons')!.setValue(persons);

    // without this, the parent dialog doesn't see the form has become dirty...
    this.personsChanged.emit();
  }
}
