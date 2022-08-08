import { createSelector, MemoizedSelector } from '@ngrx/store';

import * as fromCore from './core.reducers';
import { State, featureKey, selectCoreModuleState } from './index';

const selectCoreFeatureState: MemoizedSelector<State, fromCore.State> = createSelector(
  selectCoreModuleState,
  (state) => state[featureKey]
);

export const selectSpinnerState = createSelector(selectCoreFeatureState, (state) => state.isSpinnerOn);
