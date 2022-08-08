import { HttpErrorResponse } from '@angular/common/http';

import { createAction, props } from '@ngrx/store';

import { PersonQuality } from '@app/data-entry/models/person-quality.model';
import { Person } from '@app/project/models';
import { ProjectLight, FolderLight } from '@app/project/services/project-and-folder-light.service';
import { InstrumentType, InstrumentLight } from '../../models';
import {
  Transfer,
  TransferType,
  OwnershipType,
  TransferSetupInputStep,
  TransferSetup,
  TransferCategory,
  TransferInstrumentQtyAmount,
} from '../models';
import { Instrument2 } from '@app/data-entry/models/instrument.model';

//
// ---------- Transfers List
//

export const loadTransfersList = createAction(
  '[Transfers List Page] Load all transfers for the given project and for the given (optional) folder',
  props<{ projectId: number; folderId: number }>()
);
export const loadTransfersListSuccess = createAction(
  '[API] Transfers list loaded successfully',
  props<{
    allTransfers: Transfer[];
    allTransferCategories: TransferCategory[];
    project: ProjectLight;
    folder?: FolderLight;
  }>()
);
export const loadTransfersListError = createAction(
  '[API] Transfers list failed to load',
  props<{ error: HttpErrorResponse }>()
);

//
// ---------- Transfer Form
//

// ---------- Load transfer form data
export const loadTransferFormData = createAction(
  '[Transfer Form Page] Load transfer form data',
  props<{ projectId: number; folderId: number; transferId?: number; transferIdToCopy?: number }>()
);
export const loadTransferFormDataSuccess = createAction(
  '[API] Transfer form data loaded successfully',
  props<{
    transfer: Transfer;
    transferTypes: TransferType[];
    instruments: InstrumentLight[];
    instrumentTypes: InstrumentType[];
    personQualities: PersonQuality[];
    ownershipTypes: OwnershipType[];
    setupTransferInputSteps: TransferSetupInputStep[];
    persons: Person[];
  }>()
);
export const loadTransferFormDataError = createAction(
  '[API] Transfer form data failed to load',
  props<{ error: HttpErrorResponse }>()
);

export const setTransferDate = createAction('[Transfer Form Page] Set transfer date', props<{ date: Date }>());
export const selectTransferType = createAction(
  '[Transfer Form Page] Select transfer type',
  props<{ transferType: TransferType }>()
);

// ---------- Instrument Selector
export const submitSelectedInstrument = createAction(
  '[Instrument Selector Dialog] Submit selected instrument for given index',
  props<{ instrumentIndex: number; instrument: Instrument2 }>()
);

export const selectOwnershipTypeForInstrument = createAction(
  '[Transfer Form Page] Select ownership type for instrument',
  props<{ instrumentIndex: number; ownershipTypeId: number }>()
);

// ---------- Load Transfer Setup
export const loadTransferSetup = createAction(
  '[Transfer Form Page] Load transfer setup data',
  props<{ transferSetupId: number }>()
);
export const loadTransferSetupSuccess = createAction(
  '[API] Transfer setup data loaded successfully',
  props<{
    transferSetup: TransferSetup;
  }>()
);
export const loadTransferSetupError = createAction(
  '[API] Transfer setup data failed to load',
  props<{ error: HttpErrorResponse }>()
);

// ---------- Person for transfer Selector
export const submitSelectedPersonForTransfer = createAction(
  '[Person Selector Dialog] Submit selected person for given index',
  props<{ personIndex: number; person: Person }>()
);

// ---------- Update Transfer Instrument Qty/Amount
export const updateTransferInstrumentQtyAmount = createAction(
  '[Transfer Form Page] Update Transfer Instrument Qty/Amount',
  props<{ instrumentIndex: number; qtyAmount: TransferInstrumentQtyAmount }>()
);
// ---------- Save transfer
export const saveTransfer = createAction('[Transfer Form Page] Save transfer', props<{ transfer: Transfer }>());
export const saveTransferSuccess = createAction('[API] Save transfer succeeded', props<{ transfer: Transfer }>());
export const saveTransferError = createAction('[API] Save transfer failed', props<{ error: HttpErrorResponse }>());
// ---------- Duplicate transfer
export const duplicateTransfer = createAction(
  '[Transfer Form Page] Duplicate transfer',
  props<{ transfer: Transfer }>()
);
export const saveTransferThenDuplicate = createAction(
  '[Transfer Form Page] Save transfer then duplicate',
  props<{ transfer: Transfer }>()
);

// ---------- Delete transfer
export const deleteTransfer = createAction('[Transfer Form Page] Delete transfer', props<{ transfer: Transfer }>());
export const deleteTransferSuccess = createAction('[API] Delete transfer succeeded', props<{ transfer: Transfer }>());
export const deleteTransferError = createAction('[API] Delete transfer failed', props<{ error: HttpErrorResponse }>());

// ----------
export const cancelTransferForm = createAction(
  '[Transfer Form Page] Cancel transfer form',
  props<{ projectId: number; folderId: number }>()
);
export const cancelTransferFormSuccess = createAction('[Transfer Form Page] Cancel transfer form succeeded');
