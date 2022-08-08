import { createSelector } from '@ngrx/store';

import { selectDataEntryModuleState } from '../../store';

export const selectDashboardState = createSelector(selectDataEntryModuleState, (state) => state.dashboard);
