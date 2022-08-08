import { createReducer, on } from '@ngrx/store';

import * as coreActions from './core.actions';

export interface State {
  isSpinnerOn: boolean;
}

export const initialState: State = {
  isSpinnerOn: false,
};

//

export const reducer = createReducer(
  initialState,

  // ---------- Spinner ----------

  on(
    coreActions.showSpinner,
    (state): State => ({
      ...state,
      isSpinnerOn: true,
    })
  ),
  on(
    coreActions.hideSpinner,
    (state): State => ({
      ...state,
      isSpinnerOn: false,
    })
  )
);
