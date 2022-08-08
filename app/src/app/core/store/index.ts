/**
 * @file
 * Core State
 */
import { createFeatureSelector } from '@ngrx/store';

import * as fromCore from './core.reducers';

export const featureKey = 'coreModule';

export interface State {}

export interface CoreState extends State {
  [featureKey]: fromCore.State;
}

export const coreModuleReducers = {
  [featureKey]: fromCore.reducer,
};

export const selectCoreModuleState = createFeatureSelector<CoreState>(featureKey);
