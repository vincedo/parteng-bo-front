import { createReducer, on } from '@ngrx/store';

import { PartengHelper } from '@app/core/helpers';
import { Project } from '@app/project/models';

import * as dashboardActions from './dashboard.actions';

export interface State {
  project: Project;
  backendError: string;
}

export const initialState: State = {
  project: undefined as any,
  backendError: '',
};

//

export const reducer = createReducer(
  initialState,

  on(dashboardActions.loadDashboardData, (state): State => ({ ...initialState })),
  on(
    dashboardActions.loadDashboardDataSuccess,
    (state, { project }): State => ({
      ...state,
      project,
    })
  ),
  on(
    dashboardActions.loadDashboardDataError,
    (state, { error }): State => ({
      ...state,
      backendError: PartengHelper.formatHttpError(error),
    })
  )
);
