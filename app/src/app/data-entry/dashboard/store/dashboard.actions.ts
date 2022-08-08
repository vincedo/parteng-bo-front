import { HttpErrorResponse } from '@angular/common/http';
import { Project } from '@app/project/models';
import { createAction, props } from '@ngrx/store';

export const loadDashboardData = createAction(
  '[DataEntry Dashboard] Load dashboard data for given project',
  props<{ projectId: number }>()
);
export const loadDashboardDataSuccess = createAction(
  '[DataEntry Dashboard] Dashboard data loaded successfully',
  props<{ project: Project }>()
);
export const loadDashboardDataError = createAction(
  '[DataEntry Dashboard] Dashboard data failed to load',
  props<{ error: HttpErrorResponse }>()
);
