import { Injectable } from '@angular/core';
import { select, Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { filter, map } from 'rxjs/operators';
import { AppStoreModel } from '../models/app-store.model';
import { serviceAddDataAction, serviceRequestAction } from './services.actions';

@Injectable({ providedIn: 'root' })
export class ServicesStore {
  constructor(private store: Store<AppStoreModel>) {}

  // task(operation$: Observable<T>,)

  dispatch<T = unknown>(
    operation$: Observable<T>,
    stateSliceKey: string,
    successMessage?: string,
    failMessage?: string
  ): Observable<T> {
    this.store.dispatch(serviceRequestAction({ operation$, stateSliceKey, successMessage, failMessage }));
    return this.select<T>(stateSliceKey);
  }

  select<T>(stateSliceKey: string): Observable<T> {
    return this.store.pipe(
      // We fairly assume the initial state (AppStoreModel)
      // will provide services.data
      select((state) => state.services.data[stateSliceKey]),
      // We filter here for two reasons :
      //  - the initial state will trigger the selector. And in this initial
      // state the slice does not exist. So we don't want to trigger anything.
      // - because the on(serviceRequestAction) reducers will create the
      // stateslice with loading = true and response = undefined.
      // This what we want for loading$ (see below), but we don't want to
      // trigger an undefined response.
      // Note: in case of 204 No Content, the response is null (so,
      // everything is fine).
      filter((stateSliceValue) => {
        return !!stateSliceValue && stateSliceValue.response !== undefined;
      }),
      map((stateSliceValue) => stateSliceValue.response as T)
    );
  }

  loading$(stateSliceKey?: string): Observable<boolean> {
    if (stateSliceKey) {
      return this.store.pipe(
        select((state) => state.services.data[stateSliceKey]),
        filter((stateSliceValue) => !!stateSliceValue),
        map((stateSliceValue) => stateSliceValue.loading)
      );
    }
    return this.store.pipe(
      select((state) => state.services.data),
      map((data) => {
        return !!Object.keys(data)
          .map((key) => data[key].loading)
          .find((loading) => loading);
      })
    );
  }

  // TODO: manage errors properly
  errors$(): Observable<unknown[]> {
    return this.store.pipe(
      select((state) => state.services.data),
      map((data): unknown[] => {
        return (
          // TODO: use Object.values
          Object.keys(data)
            .filter((key) => !!data[key].error)
            .map((key) => data[key].error)
        );
      }),
      filter((errors) => errors.length > 0)
    );
  }
}
