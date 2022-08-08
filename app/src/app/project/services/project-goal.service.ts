/**
 * @file
 * Handles rel_projects_to_goals and rel_projects_to_goals_to_persons
 */
import { Injectable } from '@angular/core';

import { forkJoin, map, mergeMap, Observable, of } from 'rxjs';

import { RestService } from '@app/core/services';
import { SettingsService } from '@app/data-entry/services/settings.service';
import { Person } from '../models/person.model';
import { Project } from '../models/project.model';
import { RelProjectToGoal } from '../models/rel-project-to-goal';
import { PersonService } from './person.service';
import { HALCollection } from '@app/core/services/hal-serializer.service';
import { environment } from 'src/environments/environment';
import { EntityDto } from '@app/shared/models';

// Table "rel_projects_to_goals_to_persons"
export interface RelProjectToGoalToPersonDto extends EntityDto {
  rel_project_to_goals_projects_id: number; // PK
  rel_project_to_goals_goals_id: number; // PK
  persons_id: number; // PK
}

@Injectable({ providedIn: 'root' })
export class ProjectGoalService {
  constructor(
    private personService: PersonService,
    private settingsService: SettingsService,
    private restService: RestService
  ) {}

  //
  // ----- READ
  //

  // Load the persons related to the given project goal
  // and return the RelProjectToGoal containing the persons info
  enrichProjectGoalWithPersons$(projectId: number, relProjectToGoal: RelProjectToGoal): Observable<RelProjectToGoal> {
    return this.getPersonsRelatedToProjectGoal$(projectId, relProjectToGoal.goal.id).pipe(
      map((persons) => {
        relProjectToGoal.persons = persons;
        return relProjectToGoal;
      })
    );
  }

  // Return the persons related to the given project goal
  private getPersonsRelatedToProjectGoal$(projectId: number, goalId: number): Observable<Person[]> {
    return this.getRelProjectToGoalToPersons$(projectId, goalId).pipe(
      // tap((RAW) => console.log('RAW', RAW)),
      mergeMap((rel_persons) =>
        rel_persons.length > 0
          ? forkJoin(rel_persons.map((rel_person) => this.personService.getById$(rel_person.persons_id)))
          : of([])
      )
    );
  }

  // Get the persons associated to the given project and goal
  // This is not returned by GET /projects/ID?sets=full
  private getRelProjectToGoalToPersons$(projectId: number, goalId: number): Observable<RelProjectToGoalToPersonDto[]> {
    const embeddedKey = `rel_projects_to_goals_to_persons`;

    return this.restService
      .get<HALCollection>({ url: `${environment.api.baseURL}/projects/${projectId}/goals/${goalId}/persons` })
      .pipe(
        map((response: HALCollection) => {
          return response &&
            response._embedded &&
            response._embedded[embeddedKey] &&
            Array.isArray(response._embedded[embeddedKey])
            ? response._embedded[embeddedKey]
            : [];
        })
      ) as unknown as Observable<RelProjectToGoalToPersonDto[]>;
  }

  //
  // ----- SAVE
  //

  /**
   * @TODO: Improve!
   * The current code deletes everything then recreates.
   * The improvement would be to do a diff to find out what changed,
   * but it's tricky cause it's a 3-party relationship, i.e. projectId-goalId-personId
   */
  saveProjectGoals$(project: Project, presaveProject: Project) {
    const deleteOldProjectGoals$ = this.deleteProjectGoals$(presaveProject);
    const saveCurrentProjectGoals$ =
      project.relProjectToGoals.length > 0
        ? forkJoin(
            project.relProjectToGoals.map((relProjectToGoal) => this.saveProjectGoal$(project.id, relProjectToGoal))
          )
        : of([]);

    return deleteOldProjectGoals$.pipe(mergeMap(() => saveCurrentProjectGoals$));
  }

  private saveProjectGoal$(projectId: number, relProjectToGoal: RelProjectToGoal) {
    return this.saveRelProjectToGoal$(projectId, relProjectToGoal).pipe(
      mergeMap(() => this.saveRelProjectToGoalToPersons$(projectId, relProjectToGoal))
    );
  }

  // PUT rel_projects_to_goals
  private saveRelProjectToGoal$(projectId: number, relProjectToGoal: RelProjectToGoal): Observable<any> {
    const body = { comment: relProjectToGoal.comment, status: this.settingsService.get<number>('STATUS_ACTIVE')! };
    return this.restService.put({
      url: `${environment.api.baseURL}/projects/${projectId}/goals/${relProjectToGoal.goal.id}`,
      body,
    });
  }

  private saveRelProjectToGoalToPersons$(
    projectId: number,
    relProjectToGoal: RelProjectToGoal
  ): Observable<RelProjectToGoalToPersonDto[]> {
    return relProjectToGoal.persons.length > 0
      ? forkJoin(
          relProjectToGoal.persons.map((person) =>
            this.saveRelProjectToGoalToPerson$(projectId, relProjectToGoal.goal.id, person.id)
          )
        )
      : of([]);
  }

  // PUT rel_projects_to_goals_to_persons
  private saveRelProjectToGoalToPerson$(
    projectId: number,
    goalId: number,
    personId: number
  ): Observable<RelProjectToGoalToPersonDto> {
    const body = { status: this.settingsService.get<number>('STATUS_ACTIVE')! };
    return this.restService.put<RelProjectToGoalToPersonDto>({
      url: `${environment.api.baseURL}/projects/${projectId}/goals/${goalId}/persons/${personId}`,
      body,
    });
  }

  //
  // ----- DELETE
  //

  deleteProjectGoals$(project: Project) {
    return project.relProjectToGoals.length > 0
      ? forkJoin(
          project.relProjectToGoals.map((relProjectToGoal) => this.deleteProjectGoal$(project.id, relProjectToGoal))
        )
      : of([]);
  }

  private deleteProjectGoal$(projectId: number, relProjectToGoal: RelProjectToGoal) {
    return this.deleteRelProjectToGoalToPersons$(projectId, relProjectToGoal).pipe(
      mergeMap(() => this.deleteRelProjectToGoal$(projectId, relProjectToGoal.goal.id))
    );
  }

  // DELETE rel_projects_to_goals
  private deleteRelProjectToGoal$(projectId: number, goalId: number) {
    return this.restService.delete({ url: `${environment.api.baseURL}/projects/${projectId}/goals/${goalId}` });
  }

  private deleteRelProjectToGoalToPersons$(projectId: number, relProjectToGoal: RelProjectToGoal) {
    return relProjectToGoal.persons.length > 0
      ? forkJoin(
          relProjectToGoal.persons.map((person) =>
            this.deleteRelProjectToGoalToPerson$(projectId, relProjectToGoal.goal.id, person.id)
          )
        )
      : of([]);
  }

  // DELETE rel_projects_to_goals_to_persons
  private deleteRelProjectToGoalToPerson$(projectId: number, goalId: number, personId: number) {
    return this.restService.delete({
      url: `${environment.api.baseURL}/projects/${projectId}/goals/${goalId}/persons/${personId}`,
    });
  }
}
