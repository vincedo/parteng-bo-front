/**
 * @file
 * State for ProjectModule
 */
import { createFeatureSelector } from '@ngrx/store';

import * as fromRoot from '@app/core/store';
import * as fromProjectForm from './project-form.reducers';

export const featureKey = 'projectModule';

export interface ProjectModuleState {
  projectForm: fromProjectForm.State;
  // scopeSelector: fromScopeSelector.State;
}

export interface State extends fromRoot.State {
  [featureKey]: ProjectModuleState;
}

export const projectModuleReducers = {
  projectForm: fromProjectForm.reducer,
  // scopeSelector: fromScopeSelector.reducer,
};

export const selectProjectModuleState = createFeatureSelector<ProjectModuleState>(featureKey);
