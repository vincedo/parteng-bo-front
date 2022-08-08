import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { Store } from '@ngrx/store';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { NgxSpinnerService } from 'ngx-spinner';
import { map } from 'rxjs/operators';

import * as coreActions from './core.actions';

@Injectable()
export class CoreEffects {
  showSpinner$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(coreActions.showSpinner),
        map(() => window.setTimeout(() => this.spinner.show()))
      );
    },
    { dispatch: false }
  );

  hideSpinner$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(coreActions.hideSpinner),
        map(() => window.setTimeout(() => this.spinner.hide()))
      );
    },
    { dispatch: false }
  );

  openSnackbar$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(coreActions.openSnackbar),
        map(({ message }) =>
          this.snackBar.open(message, 'OK', {
            duration: 3000,
          })
        )
      );
    },
    { dispatch: false }
  );

  constructor(
    private actions$: Actions,
    private store: Store,
    private spinner: NgxSpinnerService,
    private snackBar: MatSnackBar
  ) {}
}
