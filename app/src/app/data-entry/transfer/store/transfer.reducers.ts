import { createReducer, on } from '@ngrx/store';

import { PartengHelper } from '@app/core/helpers';
import { InstrumentLight, InstrumentType } from '../../models';
import { Transfer, TransferType, OwnershipType, TransferSetupInputStep, TransferCategory } from '../models';
import { PersonQuality } from '@app/data-entry/models/person-quality.model';
import { Person } from '@app/project/models';
import {
  createInstrumentFieldsForTransfer,
  getInstrumentInfoForTransferTypeId,
  getInstrumentsListForInstrumentField,
  getNextInstrumentInfoForInstrument,
  getOwnershipTypesListForInstrumentField,
  InstrumentField,
  intrumentFieldAddToList,
  intrumentFieldUpdateInList,
} from './instrument-field.state';
import { isPersonFieldsCompleteForTransfer, PersonField, createPersonFieldsForTransfer } from './person-field.state';
import { ProjectLight, FolderLight } from '@app/project/services/project-and-folder-light.service';

import * as transferActions from './transfer.actions';

export interface State {
  transfersList: {
    parentProject: ProjectLight;
    parentFolder: FolderLight;
    allTransfers: Transfer[];
    backendError: string;
  };
  transferForm: {
    transfer: Transfer; // contains transfer.transferSetup
    isGeneralInfoComplete: boolean; // true when user has finished filling out "General Info" section in transferFrom
    instrumentFields: InstrumentField[];
    personFields: PersonField[];
    isPersonFieldsComplete: boolean; // true when user has finished filling out "Persons" section in transferFrom
    backendError: string;
  };
  dialogInstrumentSelector: {
    instrumentDesignation: string;
    instruments: InstrumentLight[];
    selectedInstrument: InstrumentLight;
    newInstrument: InstrumentLight;
  };
  dialogPersonSelector: {
    personQuality: string;
    selectedPerson: Person;
    newPerson: Person;
  };
  db: {
    allTransferCategories: TransferCategory[];
    allTransferTypes: TransferType[];
    allInstruments: InstrumentLight[];
    allInstrumentTypes: InstrumentType[];
    allPersonQualities: PersonQuality[];
    allOwnershipTypes: OwnershipType[];
    allSetupTransferInputSteps: TransferSetupInputStep[];
    allPersons: Person[];
  };
  defaults: {
    hideAddItemButtonInItemSelector: boolean;
  };
}

export const initialState: State = {
  transfersList: {
    parentProject: undefined as any,
    parentFolder: undefined as any,
    allTransfers: [],
    backendError: '',
  },
  transferForm: {
    transfer: undefined as any,
    isGeneralInfoComplete: false,
    instrumentFields: [],
    personFields: [],
    isPersonFieldsComplete: false,
    backendError: '',
  },
  dialogInstrumentSelector: {
    instrumentDesignation: '',
    instruments: [],
    selectedInstrument: undefined as any,
    newInstrument: undefined as any,
  },
  dialogPersonSelector: {
    personQuality: '',
    selectedPerson: undefined as any,
    newPerson: undefined as any,
  },
  db: {
    allTransferCategories: [],
    allTransferTypes: [],
    allInstruments: [],
    allInstrumentTypes: [],
    allPersonQualities: [],
    allOwnershipTypes: [],
    allSetupTransferInputSteps: [],
    allPersons: [],
  },
  defaults: {
    hideAddItemButtonInItemSelector: false,
  },
};

//

export const reducer = createReducer(
  initialState,

  //
  // ---------- Transfers List
  //

  on(
    transferActions.loadTransfersList,
    (state): State => ({
      ...state,
      transfersList: { ...initialState.transfersList },
      transferForm: { ...initialState.transferForm },
    })
  ),
  on(
    transferActions.loadTransfersListSuccess,
    (state, { allTransfers, allTransferCategories, project, folder }): State => ({
      ...state,
      transfersList: {
        ...state.transfersList,
        allTransfers,
        parentProject: project,
        parentFolder: folder!,
      },
      db: {
        ...state.db,
        allTransferCategories,
      },
    })
  ),
  on(
    transferActions.loadTransfersListError,
    (state, { error }): State => ({
      ...state,
      transfersList: {
        ...state.transfersList,
        backendError: PartengHelper.formatHttpError(error),
      },
    })
  ),

  //
  // ---------- Transfer Form
  //

  on(
    transferActions.loadTransferFormData,
    (state): State => ({
      ...state,
      transferForm: { ...initialState.transferForm }, // RESET FORM
    })
  ),
  on(
    transferActions.loadTransferFormDataSuccess,
    (
      state,
      {
        transfer,
        transferTypes,
        instruments,
        instrumentTypes,
        personQualities,
        ownershipTypes,
        setupTransferInputSteps,
        persons,
      }
    ): State => {
      const personFields = createPersonFieldsForTransfer(transfer, { allPersonQualities: personQualities });
      return {
        ...state,
        transferForm: {
          ...state.transferForm,
          transfer,
          // Compute the state props based on the current transfer
          isGeneralInfoComplete: isTransferGeneralInfoComplete(transfer),
          instrumentFields: createInstrumentFieldsForTransfer(transfer),
          personFields,
          isPersonFieldsComplete: isPersonFieldsCompleteForTransfer(personFields, transfer),
        },
        db: {
          ...state.db,
          allTransferTypes: transferTypes,
          allInstruments: instruments,
          allInstrumentTypes: instrumentTypes,
          allPersonQualities: personQualities,
          allOwnershipTypes: ownershipTypes,
          allSetupTransferInputSteps: setupTransferInputSteps,
          allPersons: persons,
        },
      };
    }
  ),
  on(
    transferActions.loadTransferFormDataError,
    (state, { error }): State => ({
      ...state,
      transferForm: {
        ...state.transferForm,
        backendError: PartengHelper.formatHttpError(error),
      },
    })
  ),
  on(
    transferActions.saveTransferSuccess,
    (state): State => ({
      ...state,
      transferForm: { ...initialState.transferForm },
    })
  ),
  on(
    transferActions.saveTransferError,
    (state, { error }): State => ({
      ...state,
      transferForm: {
        ...state.transferForm,
        backendError: PartengHelper.formatHttpError(error),
      },
    })
  ),
  on(
    transferActions.deleteTransferSuccess,
    (state): State => ({
      ...state,
      transferForm: { ...initialState.transferForm },
    })
  ),
  on(
    transferActions.cancelTransferFormSuccess,
    (state): State => ({
      ...state,
      transferForm: { ...initialState.transferForm },
    })
  ),

  //
  // ----- Select Transfer Date & Type -----
  //

  on(transferActions.setTransferDate, (state, { date }): State => {
    const updTransfer = state.transferForm.transfer.setDate(date);
    return {
      ...state,
      transferForm: {
        ...state.transferForm,
        transfer: updTransfer,
        isGeneralInfoComplete: isTransferGeneralInfoComplete(updTransfer),
      },
    };
  }),

  on(transferActions.selectTransferType, (state, { transferType }): State => {
    const updTransfer = state.transferForm.transfer.clone({ transferType });
    const instrumentInfo = getInstrumentInfoForTransferTypeId(state.db.allSetupTransferInputSteps, transferType.id);
    return {
      ...state,
      transferForm: {
        ...state.transferForm,
        transfer: updTransfer,
        instrumentFields: intrumentFieldAddToList([], { instrumentInfo }),
        isGeneralInfoComplete: isTransferGeneralInfoComplete(updTransfer),
      },
    };
  }),

  //
  // ---------- Select Transfer Instrument
  //

  // on(
  //   transferActions.openDialogInstrumentSelector,
  //   (state, { instrumentIndex }): State => ({
  //     ...state,
  //     dialogInstrumentSelector: {
  //       instrumentDesignation: state.transferForm.instrumentFields[instrumentIndex].instrumentInfo.designation,
  //       instruments: getInstrumentsListForInstrumentField(
  //         state.db.allInstruments,
  //         state.transferForm.instrumentFields[instrumentIndex]
  //       ),
  //       selectedInstrument: state.transferForm.transfer.transferInstruments[instrumentIndex]?.$instrument,
  //       newInstrument: initialState.dialogInstrumentSelector.newInstrument,
  //     },
  //   })
  // ),
  on(transferActions.submitSelectedInstrument, (state, { instrumentIndex, instrument }): State => {
    const allowedOwnershipTypes = getOwnershipTypesListForInstrumentField(
      state.db.allOwnershipTypes,
      state.transferForm.instrumentFields[instrumentIndex],
      instrument
    );
    // update the current instrument field
    let updInstrumentFields = intrumentFieldUpdateInList(
      state.transferForm.instrumentFields,
      instrumentIndex,
      {
        allowedOwnershipTypes,
      },
      { resetNext: true }
    );
    // update the previous instrument field, if any: it should become non editable
    if (instrumentIndex > 0) {
      updInstrumentFields = intrumentFieldUpdateInList(updInstrumentFields, instrumentIndex - 1, { isEditable: false });
    }

    return {
      ...state,
      // reset dialog + update transfer and transfer form state
      dialogInstrumentSelector: { ...initialState.dialogInstrumentSelector },
      transferForm: {
        ...state.transferForm,
        transfer: state.transferForm.transfer.updateTransfInstrument(
          instrumentIndex,
          {
            instruments_id: instrument.id,
            instrument_number: instrumentIndex + 1,
            $instrument: instrument,
          },
          { resetNext: true }
        ),
        instrumentFields: updInstrumentFields,
      },
    };
  }),

  //
  // ---------- Select Ownership Type for Transfer Instruments
  //

  on(transferActions.selectOwnershipTypeForInstrument, (state, { instrumentIndex, ownershipTypeId }): State => {
    const previousId = state.transferForm.instrumentFields[instrumentIndex].instrumentInfo.previousId;
    const instrumentTypeId =
      state.transferForm.transfer.transferInstruments[instrumentIndex].$instrument.instrumentTypeId;

    const { transferSetupId, instrumentInfo } = getNextInstrumentInfoForInstrument(
      state.db.allSetupTransferInputSteps,
      {
        previousId,
        instrumentTypeId,
        ownershipTypeId,
      }
    );

    return {
      ...state,
      transferForm: {
        ...state.transferForm,
        // update the current transfer with transferSetupId + selected ownership type
        transfer: state.transferForm.transfer
          .clone({ setup_transfers_id: transferSetupId })
          .updateTransfInstrument(instrumentIndex, {
            $ownershipType: state.db.allOwnershipTypes.find((o) => o.id === ownershipTypeId),
          }),
        // add a new instrument field if some instrument info was returned for the next step
        instrumentFields: instrumentInfo
          ? intrumentFieldAddToList(state.transferForm.instrumentFields, { instrumentInfo })
          : state.transferForm.instrumentFields,
      },
    };
  }),

  //
  // ---------- Load Transfer Setup
  //

  on(transferActions.loadTransferSetupSuccess, (state, { transferSetup }): State => {
    const updTransfer = state.transferForm.transfer.clone({ transferSetup });
    return {
      ...state,
      transferForm: {
        ...state.transferForm,
        transfer: updTransfer,
        personFields: createPersonFieldsForTransfer(updTransfer, {
          allPersonQualities: state.db.allPersonQualities,
        }),
      },
    };
  }),
  on(
    transferActions.loadTransferSetupError,
    (state, { error }): State => ({
      ...state,
      transferForm: {
        ...state.transferForm,
        backendError: PartengHelper.formatHttpError(error),
      },
    })
  ),

  //
  // ---------- Select Transfer Persons
  //

  on(transferActions.submitSelectedPersonForTransfer, (state, { personIndex, person }): State => {
    const updTransfer = state.transferForm.transfer.updateTransfPerson(personIndex, {
      persons_id: person.id,
      person_number: personIndex + 1,
      $person: person,
    });

    // selecting the 1st person makes the last instrument field non-editable
    const updInstrumentFields =
      personIndex === 0
        ? intrumentFieldUpdateInList(
            state.transferForm.instrumentFields,
            state.transferForm.instrumentFields.length - 1,
            { isEditable: false }
          )
        : state.transferForm.instrumentFields;

    return {
      ...state,
      // reset dialog + update transfer and transfer form state
      dialogPersonSelector: { ...initialState.dialogPersonSelector },
      transferForm: {
        ...state.transferForm,
        transfer: updTransfer,
        instrumentFields: updInstrumentFields,
        isPersonFieldsComplete: isPersonFieldsCompleteForTransfer(state.transferForm.personFields, updTransfer),
      },
    };
  }),

  //
  // ---------- Update Transfer Instrument Qty/Amount
  //

  on(
    transferActions.updateTransferInstrumentQtyAmount,
    (state, { instrumentIndex, qtyAmount }): State => ({
      ...state,
      transferForm: {
        ...state.transferForm,
        transfer: state.transferForm.transfer.updateTransfInstrument(instrumentIndex, {
          input_quantity: qtyAmount.input_quantity,
          input_accounting_unit_value: qtyAmount.input_accounting_unit_value,
          input_accounting_total_amount: qtyAmount.input_accounting_total_amount,
          input_actual_unit_value: qtyAmount.input_actual_unit_value,
          input_actual_total_amount: qtyAmount.input_actual_total_amount,
        }),
      },
    })
  )
);

//
// ---------- Helper(s)
//

// Return true if the fields in the "General Info" of the transfer form have been filled out.
function isTransferGeneralInfoComplete(transfer: Transfer): boolean {
  return !!transfer.date && !!transfer.transferType;
}
