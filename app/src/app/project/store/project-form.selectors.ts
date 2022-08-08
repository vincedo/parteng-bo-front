import { createSelector, MemoizedSelector } from '@ngrx/store';

import { State } from '@app/core/store';
import { selectProjectModuleState } from './index';

import * as fromProjectForm from './project-form.reducers';

const selectProjectFormFeatureState: MemoizedSelector<State, fromProjectForm.State> = createSelector(
  selectProjectModuleState,
  (state) => state.projectForm
);

//
// ---------- Projects List
//

export const selectProjectsListState = createSelector(selectProjectFormFeatureState, (state) => ({
  allProjects: state.projectsList.allProjects,
  highlightedProject: state.projectsList.highlightedProject,
  backendError: state.projectsList.backendError,
}));

//
// ---------- Project Form
//

export const selectProjectFormState = createSelector(selectProjectFormFeatureState, (state) => ({
  project: state.projectForm.project,
  isNew: state.projectForm.isNew,
  projectTemplates: state.db.allTemplates,
  template: state.db.allTemplates.find((t) => t.id === state.projectForm.templateId),
  allStandardFolders: state.db.allStandardFolders,
  formSectionsState: state.projectForm.formSectionsState,
  backendError: state.projectForm.backendError,
}));

//
// ---------- Goal Selector
//

export const selectDialogGoalSelectorState = createSelector(selectProjectFormFeatureState, (state) => ({
  allGoals: state.db.allGoals,
  selectedGoals: state.projectForm.project.relProjectToGoals.map((rel) => rel.goal),
}));
