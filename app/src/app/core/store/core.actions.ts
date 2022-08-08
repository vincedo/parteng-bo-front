import { createAction, props } from '@ngrx/store';

// Action that does nothing, required in some scenarios
export const noOp = createAction('[Core] No Op');

export const showSpinner = createAction('[Core] Show spinner');
export const hideSpinner = createAction('[Core] Hide spinner');
export const openSnackbar = createAction('[Core] Open snackbar', props<{ message: string }>());
