/**
 * @file
 * A project as displayed in the main projects list.
 * Some properties have been modified to facilitate display and/or filtering.
 */
import { VALIDATION_STATUS } from '@app/shared/models';
import { PROJECT_ORDINARY } from './project-ordinary.enum';
import { Project } from './project.model';

export interface ProjectItem {
  id: number;
  name: string;
  ordinary: PROJECT_ORDINARY;
  scopeCodesStr: string; // codes of project scopes as string
  scopesStr: string; // all project scopes as a single string (name + historical_name)
  goalsStr: string; // all project goals as a single string
  date_min: string;
  date_max: string;
  validation_status: VALIDATION_STATUS;
  comment?: string;
}

export function projectToProjectItem(project: Project): ProjectItem {
  const projectScopes = project.relProjectToScopes.map((rel) => rel.scope);

  const item: ProjectItem = {
    id: project.id,
    name: project.name,
    ordinary: project.ordinary,
    // convert project scopes and goals to strings so that
    // these fields may be used as filters in the projects list
    scopeCodesStr: projectScopes.map((scope) => scope.code).join(','),
    scopesStr: projectScopes.map((scope) => `${scope.name}__${scope.historicalName}`).join(','),
    goalsStr: project.relProjectToGoals.map((rel) => rel.goal.name).join(','),
    date_min: project.dateMin,
    date_max: project.dateMax,
    validation_status: project.validationStatus,
    comment: project.comment,
  };

  return item;
}

export function project2ToProjectItem(project: Project): ProjectItem {
  const item: ProjectItem = {
    id: project.id,
    name: project.name,
    ordinary: project.ordinary,
    // convert project scopes and goals to strings so that
    // these fields may be used as filters in the projects list
    scopeCodesStr: project.relProjectToScopes
      .map((rel) => rel.scope)
      .map((scope) => scope.code)
      .join(','),
    scopesStr: project.relProjectToScopes
      .map((rel) => rel.scope)
      .map((scope) => `${scope.name}__${scope.historicalName}`)
      .join(','),
    goalsStr: project.relProjectToGoals.map((rel) => rel.goal.name).join(','),
    date_min: project.dateMin,
    date_max: project.dateMax,
    validation_status: project.validationStatus,
    comment: project.comment,
  };
  return item;
}
