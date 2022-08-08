import * as _ from 'lodash';

import { EntityWithId, VALIDATION_STATUS } from '@app/shared/models';
import { Scope } from './scope.model';
import { Folder, standardFolder2sToFolder2s } from './folder.model';
import { ProjectTemplate2 } from './project-template.model';
import { HALDeserializeFrom, HALSerializeTo } from '@app/core/services/hal-serializer.service';
import { goalsToRelProjectToGoals, RelProjectToGoal } from './rel-project-to-goal';
import { RelProjectToScope, scopesToRelProjectToScopes } from './rel-project-to-scope';
import { Goal } from './goal.model';

export class Project extends EntityWithId {
  @HALDeserializeFrom()
  @HALSerializeTo()
  override status: number = 0;

  @HALDeserializeFrom()
  override id: number = 0;

  @HALDeserializeFrom()
  @HALSerializeTo()
  name: string = '';

  @HALDeserializeFrom()
  @HALSerializeTo()
  ordinary: number = 0;

  @HALDeserializeFrom('long_name')
  longName: string = '';

  @HALDeserializeFrom('validation_status')
  @HALSerializeTo('validation_status')
  validationStatus: number = 0;

  @HALDeserializeFrom('date_max')
  dateMax: string = '';

  @HALDeserializeFrom('date_min')
  dateMin: string = '';

  @HALDeserializeFrom()
  @HALSerializeTo()
  comment: string = '';

  @HALDeserializeFrom('folders', Folder)
  folders: Folder[] = [];

  @HALDeserializeFrom('rel_projects_to_goals', RelProjectToGoal)
  relProjectToGoals: RelProjectToGoal[] = [];

  @HALDeserializeFrom('rel_projects_to_scopes', RelProjectToScope)
  relProjectToScopes: RelProjectToScope[] = [];

  // JS-computed long name - Do not confuse with project.long_name
  get long_name_js(): string {
    const projectName = this.name ?? 'Intitulé du projet';
    const scopes = this.relProjectToScopes.map((relProjectToScope) => relProjectToScope.scope);
    const scopeCodes = _.sortBy(scopes, 'code').map((scope) => scope.code);
    const scopeStr = `[${scopeCodes.join(', ')}]`;
    const dateRange: any[] = [];
    const dateRangeStr = dateRange.length > 0 ? `[${dateRange.join(' &lt; ')}]` : ``;
    const isEmpty = !this.name && scopeCodes.length === 0;
    return !isEmpty ? `${scopeStr} ${projectName} ${dateRangeStr}` : ``;
  }

  /**
   * Use this to modify a project in the store (cause store data is immutable).
   *
   * WARNING: Using project.clone({ goals }) will override any existing project goals.
   * Use project.updateGoals() to update the project goals while preserving the existing relProjectToGoals.
   */
  clone(
    opts: Partial<{
      id: number;
      status: number;
      ordinary: number;
      name: string;
      comment: string;
      validationStatus: number;
      scopes: Scope[];
      goals: Goal[];
      folders: Folder[];
    }> = {}
  ): Project {
    const clone = new Project();

    clone.id = opts.id !== undefined ? opts.id : this.id;
    clone.status = opts.status !== undefined ? opts.status : this.status;

    clone.ordinary = opts.ordinary !== undefined ? opts.ordinary : this.ordinary;
    clone.name = opts.name !== undefined ? opts.name : this.name;
    clone.comment = opts.comment !== undefined ? opts.comment : this.comment;
    clone.validationStatus = opts.validationStatus !== undefined ? opts.validationStatus : this.validationStatus;
    clone.folders = opts.folders || [...this.folders];

    clone.relProjectToScopes = opts.scopes
      ? scopesToRelProjectToScopes(opts.scopes, this.id)
      : [...this.relProjectToScopes];
    clone.relProjectToGoals = opts.goals ? goalsToRelProjectToGoals(opts.goals, this.id) : [...this.relProjectToGoals];

    // Some props can't be updated.
    clone.created = this.created;
    clone.updated = this.updated;
    clone.longName = this.longName;
    clone.dateMin = this.dateMin;
    clone.dateMax = this.dateMax;

    return clone;
  }

  /**
   * Add the given goals to the project while preserving the existing relProjectToGoals,
   * which might already have associated comments and/or persons.
   */
  updateGoals(currentlySelectedGoals: Goal[]): Project {
    const project = this.clone();

    // only keep the goals which are currently selected
    const selectedGoalIds = currentlySelectedGoals.map((goal) => goal.id);
    let relProjectToGoals = project.relProjectToGoals.filter((rel) => selectedGoalIds.includes(rel.goal.id));
    // add the new goals
    const existingGoalIds = project.relProjectToGoals.map((rel) => rel.goal.id);
    const newGoals = currentlySelectedGoals.filter((goal) => !existingGoalIds.includes(goal.id));
    relProjectToGoals = [...relProjectToGoals, ...goalsToRelProjectToGoals(newGoals, project.id)];
    // sort by goal.order
    relProjectToGoals = _.sortBy(relProjectToGoals, 'goal.order');
    project.relProjectToGoals = relProjectToGoals;

    return project;
  }

  updateRelProjectToGoal(relProjectToGoal: RelProjectToGoal): Project {
    const project = this.clone();
    project.relProjectToGoals = project.relProjectToGoals.map((rel) =>
      rel.goals_id === relProjectToGoal.goals_id ? relProjectToGoal : rel
    );
    return project;
  }

  updateAllRelProjectToGoals(relProjectToGoals: RelProjectToGoal[]): Project {
    const project = this.clone();
    project.relProjectToGoals = relProjectToGoals;
    return project;
  }

  removeGoal(goal: Goal): Project {
    const project = this.clone();
    project.relProjectToGoals = project.relProjectToGoals.filter((rel) => rel.goals_id !== goal.id);
    return project;
  }

  /**
   * Add or update the given folder in the project
   *
   * @param folder
   * @param folderIndex If undefined, we're adding a new folder. If set, we're updating.
   */
  saveProjectFolder(folder: Folder, folderIndex?: number): Project {
    const newFolderOrder = Math.max(...this.folders.map((folder) => folder.order)) + 1;

    return this.clone({
      folders:
        folderIndex !== undefined
          ? this.folders.slice(0, folderIndex).concat(folder, this.folders.slice(folderIndex + 1))
          : [...this.folders, folder.clone({ order: newFolderOrder })],
    });
  }

  removeProjectFolder(folderIndex: number): Project {
    return this.clone({ folders: this.folders.filter((_, index) => index !== folderIndex) });
  }

  /**
   * Reorder project folders (used when reordering folders via drag & drop).
   *
   * When saving a folder with an updated folder.order property, the backend will
   * return a conflict error (e.g. we'll try to save a folder with order = 1 while
   * another folder already exists in that position).
   *
   * As a temporary fix, we renumber the folder sequence by starting at max(order) + 1.
   */
  reorderProjectFolders(folders: Folder[]): Project {
    const orderStart = Math.max(...folders.map((folder) => folder.order)) + 1;
    return this.clone({ folders: folders.map((folder, i) => folder.clone({ order: orderStart + i })) });
  }
}

//
// ----- Helper Functions
//

export function project2CreateNew(): Project {
  const project = new Project();
  project.validationStatus = VALIDATION_STATUS.NOT_REVIEWED;
  return project;
}

export function project2ApplyTemplate(project: Project, template: ProjectTemplate2): Project {
  let projectUpdated = project.clone({
    name: template.projectNameTemplate,
    folders: standardFolder2sToFolder2s(template.relProjectTemplateToStandardFolders.map((rel) => rel.standard_folder)),
    goals: template.relProjectTemplateToGoals.map((rel) => rel.goal),
  });
  return projectUpdated;
}
