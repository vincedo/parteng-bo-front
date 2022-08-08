/**
 * @file
 * State for DataEntryModule
 */
import { createFeatureSelector } from '@ngrx/store';

import * as fromRoot from '@app/core/store';
import * as fromDashboard from '../dashboard/store/dashboard.reducers';
import * as fromTransfer from '../transfer/store/transfer.reducers';
// import * as fromInstrument from '../instrument/store/instrument.reducers';

export const featureKey = 'dataEntryModule';

export interface DataEntryModuleState {
  dashboard: fromDashboard.State;
  transfer: fromTransfer.State;
  // instrument: fromInstrument.State;
}

export const dataEntryModuleReducers = {
  dashboard: fromDashboard.reducer,
  transfer: fromTransfer.reducer,
  // instrument: fromInstrument.reducer,
};

export interface State extends fromRoot.State {
  [featureKey]: DataEntryModuleState;
}

export const selectDataEntryModuleState = createFeatureSelector<DataEntryModuleState>(featureKey);
