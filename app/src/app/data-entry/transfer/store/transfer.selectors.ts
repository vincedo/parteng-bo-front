import { createSelector } from '@ngrx/store';

import { selectDataEntryModuleState } from '../../store';

const selectTransferState = createSelector(selectDataEntryModuleState, (state) => state.transfer);

//
// ---------- Transfers List
//

export const selectTransfersListState = createSelector(selectTransferState, (state) => ({
  parentProject: state.transfersList.parentProject,
  parentFolder: state.transfersList.parentFolder,
  allTransfers: state.transfersList.allTransfers,
  allTransferCategories: state.db.allTransferCategories,
  backendError: state.transfersList.backendError,
}));

//
// ---------- Transfer Form
//

export const selectTransferFormState = createSelector(selectTransferState, (state) => ({
  // transfer form
  transfer: state.transferForm.transfer,
  instrumentFields: state.transferForm.instrumentFields,
  personFields: state.transferForm.personFields,
  isPersonFieldsComplete: state.transferForm.isPersonFieldsComplete,
  isGeneralInfoComplete: state.transferForm.isGeneralInfoComplete,
  backendError: state.transferForm.backendError,
  // db
  transferTypes: state.db.allTransferTypes,
  instrumentTypes: state.db.allInstrumentTypes,
  personQualities: state.db.allPersonQualities,
  ownershipTypes: state.db.allOwnershipTypes,
}));

export const selectDialogInstrumentSelectorState = createSelector(selectTransferState, (state) => ({
  allItems: state.dialogInstrumentSelector.instruments,
  selectedItems: state.dialogInstrumentSelector.selectedInstrument
    ? [state.dialogInstrumentSelector.selectedInstrument]
    : [],
  newItem: state.dialogInstrumentSelector.newInstrument,
  // dialog customisations
  forEntityName: state.dialogInstrumentSelector.instrumentDesignation,
  dialogTitleTranskateKey: '',
  hideAddItemButton: state.defaults.hideAddItemButtonInItemSelector,
}));

export const selectDialogPersonSelectorState = createSelector(selectTransferState, (state) => ({
  allItems: state.db.allPersons,
  selectedItems: state.dialogPersonSelector.selectedPerson ? [state.dialogPersonSelector.selectedPerson] : [],
  newItem: state.dialogPersonSelector.newPerson,
  // dialog customisations
  forEntityName: state.dialogPersonSelector.personQuality,
  dialogTitleTranskateKey: '',
  hideAddItemButton: state.defaults.hideAddItemButtonInItemSelector,
}));

export const selectAllSetupTransferInputSteps = createSelector(
  selectTransferState,
  (state) => state.db.allSetupTransferInputSteps
);
