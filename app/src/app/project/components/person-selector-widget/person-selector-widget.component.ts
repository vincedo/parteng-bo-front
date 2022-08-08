import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { Store } from '@ngrx/store';
import { lastValueFrom, Subscription } from 'rxjs';

import { Person, Project } from '@app/project/models';
import { PersonService } from '@app/project/services/person.service';
import { RelProjectToGoal } from '@app/project/models/rel-project-to-goal';

@Component({
  selector: 'parteng-person-selector-widget',
  templateUrl: './person-selector-widget.component.html',
  styleUrls: ['./person-selector-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonSelectorWidgetComponent implements OnInit, OnDestroy {
  @Input() relProjectToGoal!: RelProjectToGoal;

  @Output() personsChanged = new EventEmitter<Person[]>();

  persons!: Person[];
  private dialogSub!: Subscription;

  constructor(private personService: PersonService) {}

  ngOnInit(): void {
    this.persons = [...this.relProjectToGoal.persons];
  }

  ngOnDestroy(): void {
    if (this.dialogSub) this.dialogSub.unsubscribe();
  }

  removePerson(person: Person): void {
    this.persons = this.persons.filter((p) => p.id !== person.id);
    this.emitPersons();
  }

  async clickOpenPersonSelector(): Promise<void> {
    const persons: Person[] | undefined = await lastValueFrom(
      this.personService.showPersonSelectorDialog({
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        project: { id: this.relProjectToGoal.projects_id } as Project,
        selectedPersons: this.persons,
        title: 'project.dialogGoalEnricher.dialogPersonSelector.title',
        titleName: this.relProjectToGoal.goal.name,
        description: 'project.dialogGoalEnricher.dialogPersonSelector.description',
        isMonoSelection: false,
        forceLargeWidth: true,
      })
    );
    if (persons) {
      this.onPersonsChanged(persons);
    }
  }

  private onPersonsChanged(persons: Person[]): void {
    this.persons = [...persons];
    this.emitPersons();
  }

  private emitPersons(): void {
    this.personsChanged.emit(this.persons);
  }
}
