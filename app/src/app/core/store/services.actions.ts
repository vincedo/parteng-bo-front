import { createAction, props } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';
import { Observable } from 'rxjs';

export interface ServiceRequestActionProps {
  operation$: Observable<unknown>;
  stateSliceKey: string;
  successMessage?: string;
  failMessage?: string;
}
export const serviceRequestAction = createAction('[SERVICE] REQUEST', props<ServiceRequestActionProps>());
export type ServiceRequestAction = TypedAction<'[SERVICE] REQUEST'> & ServiceRequestActionProps;

export interface ServiceAddDataActionProps {
  data: unknown;
  stateSliceKey: string;
}
export const serviceAddDataAction = createAction('[SERVICE] ADD DATA', props<ServiceAddDataActionProps>());
export type ServiceAddDataAction = TypedAction<'[SERVICE] ADD DATA'> & ServiceAddDataActionProps;

export interface ServiceResponseActionProps {
  stateSliceKey: string;
  result: unknown;
}
export const serviceResponseAction = createAction('[SERVICE] RESPONSE', props<ServiceResponseActionProps>());
export type ServiceResponseAction = TypedAction<'[SERVICE] RESPONSE'> & ServiceResponseActionProps;

export interface ServiceErrorActionProps {
  stateSliceKey: string;
  error: unknown;
}
export const serviceErrorAction = createAction('[SERVICE] ERROR', props<ServiceErrorActionProps>());
export type ServiceErrorAction = TypedAction<'[SERVICE] ERROR'> & ServiceErrorActionProps;
