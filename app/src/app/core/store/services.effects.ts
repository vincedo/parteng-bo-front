import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, mergeMap, tap } from 'rxjs/operators';
import { ErrorService } from '../services/error.service';
import {
  serviceErrorAction,
  ServiceRequestAction,
  serviceRequestAction,
  serviceResponseAction,
} from './services.actions';

@Injectable()
export class ServicesEffects {
  constructor(private actions$: Actions, private snackBar: MatSnackBar, private errorService: ErrorService) {}

  serviceRequest$ = createEffect(() =>
    this.actions$.pipe(
      ofType(serviceRequestAction),
      mergeMap((action: ServiceRequestAction) => {
        return action.operation$.pipe(
          map((result) => {
            return serviceResponseAction({
              stateSliceKey: action.stateSliceKey,
              result,
            });
          }),
          tap(() => {
            action.successMessage && this.snackBar.open(`${action.successMessage}`, '', { duration: 3000 });
          }),
          catchError((e: any, caught: any) => {
            this.errorService.onError(action.failMessage, e);
            return of(serviceErrorAction({ stateSliceKey: action.stateSliceKey, error: e }));
          })
        );
      })
    )
  );
}
