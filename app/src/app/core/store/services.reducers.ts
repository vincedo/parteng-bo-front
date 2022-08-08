import { Action, createFeatureSelector, createReducer, on } from '@ngrx/store';
import {
  serviceAddDataAction,
  serviceErrorAction,
  serviceRequestAction,
  serviceResponseAction,
} from './services.actions';

export const serviceStateKey = 'service';

export interface ServicesStateDataModel {
  [sliceStateKey: string]: ServicesStateSliceModel;
}

export interface ServicesStateModel {
  data: ServicesStateDataModel;
}

export interface ServicesStateSliceModel {
  loading: boolean;
  response: unknown;
  error: unknown;
}

const initialState: ServicesStateModel = {
  data: {},
};

export const initialServiceStateSlice: ServicesStateSliceModel = {
  loading: false,
  response: undefined,
  error: undefined,
};

const reducer = createReducer(
  initialState,

  on(serviceRequestAction, (state, { stateSliceKey }): ServicesStateModel => {
    // TODO: faire plus propre
    const parts = stateSliceKey.split('.');
    if (parts.length > 1) {
      stateSliceKey = parts[0];
      const subKey = parts[1];
      return {
        ...state,
        data: {
          ...state.data,
          [stateSliceKey]: {
            loading: false,
            response: { ...(state.data[stateSliceKey].response as any), [subKey]: undefined },
            error: undefined,
          },
        },
      };
    }
    return {
      ...state,
      data: {
        ...state.data,
        [stateSliceKey]: {
          ...state.data[stateSliceKey],
          loading: true,
        },
      },
    };
  }),
  on(serviceResponseAction, (state, { stateSliceKey, result }): ServicesStateModel => {
    // TODO: faire plus propre
    const parts = stateSliceKey.split('.');
    if (parts.length > 1) {
      stateSliceKey = parts[0];
      const subKey = parts[1];
      return {
        ...state,
        data: {
          ...state.data,
          [stateSliceKey]: {
            loading: false,
            response: { ...(state.data[stateSliceKey].response as any), [subKey]: result },
            error: undefined,
          },
        },
      };
    }
    return {
      ...state,
      data: {
        ...state.data,
        [stateSliceKey]: {
          loading: false,
          response: result,
          error: undefined,
        },
      },
    };
  }),
  on(serviceAddDataAction, (state, { stateSliceKey, data }): ServicesStateModel => {
    // TODO: faire plus propre
    const parts = stateSliceKey.split('.');
    if (parts.length > 1) {
      stateSliceKey = parts[0];
      const subKey = parts[1];
      const subObj = (state.data[stateSliceKey].response as any)[subKey];
      return {
        ...state,
        data: {
          ...state.data,
          [stateSliceKey]: {
            loading: false,
            // TODO: finish
            response: {
              ...(state.data[stateSliceKey].response as any),
              [subKey]: { ...subObj, response: Array.isArray(subObj.response) ? [...subObj.response, data] : data },
            },
            error: undefined,
          },
        },
      };
    }
    return {
      ...state,
      data: {
        ...state.data,
        [stateSliceKey]: {
          ...state.data[stateSliceKey],
          response: Array.isArray(state.data[stateSliceKey])
            ? [...(state.data[stateSliceKey] as unknown as Array<unknown>), data]
            : data,
        },
      },
    };
  }),

  on(serviceErrorAction, (state, { stateSliceKey, error }): ServicesStateModel => {
    // TODO: faire plus propre
    const parts = stateSliceKey.split('.');
    if (parts.length > 1) {
      stateSliceKey = parts[0];
      const subKey = parts[1];
      return {
        ...state,
        data: {
          ...state.data,
          [stateSliceKey]: {
            loading: false,
            response: { ...(state.data[stateSliceKey].response as any), [subKey]: undefined },
            error,
          },
        },
      };
    }
    return {
      ...state,
      data: {
        ...state.data,
        [stateSliceKey]: {
          loading: false,
          response: undefined,
          error,
        },
      },
    };
  })
);

export function servicesReducer(state: ServicesStateModel | undefined, action: Action) {
  return reducer(state, action);
}

export const selectServicesState = createFeatureSelector<ServicesStateModel>('service');
