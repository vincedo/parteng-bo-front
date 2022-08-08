import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { of } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { Actions, createEffect, ofType } from '@ngrx/effects';

import { DataEntryDashboardDataService } from '../services/data-entry-dashboard-data.service';

import * as coreActions from '@app/core/store/core.actions';
import * as dashboardActions from './dashboard.actions';

@Injectable()
export class DashboardEffects {
  loadDashboardData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(dashboardActions.loadDashboardData),
      mergeMap(({ projectId }) =>
        this.dataEntryDashboardDataService.getData$(projectId).pipe(
          map((data) => dashboardActions.loadDashboardDataSuccess(data)),
          catchError((error: HttpErrorResponse) => of(dashboardActions.loadDashboardDataError({ error })))
        )
      )
    );
  });

  //
  // ----- Spinner -----
  //

  showSpinner$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(dashboardActions.loadDashboardData),
      map(() => coreActions.showSpinner())
    );
  });

  hideSpinner$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(dashboardActions.loadDashboardDataSuccess, dashboardActions.loadDashboardDataError),
      map(() => coreActions.hideSpinner())
    );
  });

  //

  constructor(private actions$: Actions, private dataEntryDashboardDataService: DataEntryDashboardDataService) {}
}
