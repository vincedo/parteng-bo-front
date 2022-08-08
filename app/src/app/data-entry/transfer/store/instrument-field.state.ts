import * as _ from 'lodash';

import { JsHelper } from '@app/core/helpers';
import { InstrumentLight } from '@app/data-entry/models';
import { OwnershipType, Transfer, TransferInstrument, TransferSetupInputStep } from '../models';
import { Instrument2 } from '@app/data-entry/models/instrument.model';

//
// ----- Interfaces -----
//

export interface InstrumentInfo {
  previousId: number; // setup_transfer_input_steps.previous_id
  designation: string;
  allowedInstrumentTypesIds: number[];
  allowedOwnershipTypesIdsForInstrumentTypes: { [k: number]: number[] };
}

export interface InstrumentField {
  instrumentInfo: InstrumentInfo;
  allowedOwnershipTypes: OwnershipType[]; // available once an instrument is selected; derived from allowedOwnershipTypesIdsForInstrumentTypes
  isEditable: boolean; // whether the user can still edit the field in the form
}

export const instrumentFieldDefaults: InstrumentField = {
  instrumentInfo: undefined as any,
  allowedOwnershipTypes: [],
  isEditable: true,
};

//
// ----- InstrumentField API -----
//

export function createInstrumentFieldsForTransfer(transfer: Transfer): InstrumentField[] {
  if (transfer.transferSetup) {
    const setupInstruments = _.sortBy(transfer.transferSetup.setupInstruments, 'instrument_number');
    return setupInstruments.map((setupInstrument) => {
      const instrumentField: InstrumentField = {
        instrumentInfo: {
          previousId: 0,
          designation: setupInstrument.instrument_designation,
          allowedInstrumentTypesIds: [],
          allowedOwnershipTypesIdsForInstrumentTypes: {},
        },
        allowedOwnershipTypes: [], // setupInstrument.ownership_types_id
        isEditable: false,
      };
      return instrumentField;
    });
  } else {
    return [];
  }
}

/**
 * Add a new instrument field to the given list of instrument fields.
 */
export function intrumentFieldAddToList(
  instrumentFields: InstrumentField[],
  instrumentField: Partial<InstrumentField>
): InstrumentField[] {
  const newInstrumentField: InstrumentField = {
    ...instrumentFieldDefaults,
    ...instrumentField,
  };
  return [...instrumentFields, newInstrumentField];
}

/**
 * Update an instrument field in the given list of instrument fields.
 *
 * @param instrumentFields The list of instrument fields to update
 * @param index The index for the instrument field to update
 * @param updates The data to update in the instrument field
 * @param opts.resetNext If true, then remove all instrument fields that follow the one that's being updated
 */
export function intrumentFieldUpdateInList(
  instrumentFields: InstrumentField[],
  index: number,
  updates: {
    allowedOwnershipTypes?: OwnershipType[];
    isEditable?: boolean;
  },
  opts = { resetNext: false }
): InstrumentField[] {
  const instrumentFieldsCopy = opts.resetNext
    ? instrumentFields.filter((instrField, i) => i <= index)
    : [...instrumentFields];
  instrumentFieldsCopy[index] = { ...instrumentFields[index], ...updates };
  return instrumentFieldsCopy;
}

/**
 * Return the list of allowed instruments for the given instrument field.
 */
export function getInstrumentsListForInstrumentField(
  allInstruments: InstrumentLight[],
  instrumentField: InstrumentField
): InstrumentLight[] {
  return allInstruments.filter((instr) =>
    instrumentField.instrumentInfo.allowedInstrumentTypesIds.includes(instr.instrument_types_id)
  );
}

/**
 * Return the list of allowed ownership types for the given
 * instrument field and selected instrument.
 */
export function getOwnershipTypesListForInstrumentField(
  allOwnershipTypes: OwnershipType[],
  instrumentField: InstrumentField,
  instrument: Instrument2
): OwnershipType[] {
  const allowedOwnershipTypesIds =
    instrumentField.instrumentInfo.allowedOwnershipTypesIdsForInstrumentTypes[instrument.instrumentTypeId];
  return _.sortBy(
    allOwnershipTypes.filter((ownshipType) => allowedOwnershipTypesIds.includes(ownshipType.id)),
    'order'
  );
}

//
// ----- InstrumentInfo API -----
//

/**
 * Return the information about which instrument types and ownership types
 * are allowed for the given transfer type id.
 */
export function getInstrumentInfoForTransferTypeId(
  allInputSteps: TransferSetupInputStep[],
  transferTypeId: number
): InstrumentInfo {
  const stepLevel1 = allInputSteps.find((step) => step.transfer_types_id === transferTypeId && step.level === 1)!;
  const stepsLevel2 = allInputSteps.filter((step) => step.previous_id === stepLevel1.id && step.level === 2);

  const instrumentInfo: InstrumentInfo = {
    previousId: stepLevel1.id,
    designation: stepLevel1.instrument_designation!,
    allowedInstrumentTypesIds: JsHelper.arrUnique(stepsLevel2.map((step) => step.previous_instrument_types_id!)),
    allowedOwnershipTypesIdsForInstrumentTypes: stepsLevel2.reduce((obj: { [k: number]: number[] }, step) => {
      if (step.previous_instrument_types_id && step.previous_ownership_types_id) {
        if (obj[step.previous_instrument_types_id]) {
          obj[step.previous_instrument_types_id].push(step.previous_ownership_types_id);
        } else {
          obj[step.previous_instrument_types_id] = [step.previous_ownership_types_id];
        }
      }
      return obj;
    }, {}),
  };

  return instrumentInfo;
}

/**
 * Return the information about the allowed instrument types and ownership types
 * for the next instrument, once the current instrument has been fully selected.
 */
export function getNextInstrumentInfoForInstrument(
  allInputSteps: TransferSetupInputStep[],
  currInstrument: {
    previousId: number;
    instrumentTypeId: number;
    ownershipTypeId: number;
  }
): { transferSetupId: number | undefined; instrumentInfo: InstrumentInfo | undefined } {
  const foundSteps = allInputSteps.filter(
    (inputStep) =>
      inputStep.previous_id === currInstrument.previousId &&
      inputStep.previous_instrument_types_id === currInstrument.instrumentTypeId &&
      inputStep.previous_ownership_types_id === currInstrument.ownershipTypeId
  );
  // safeguard: this function should never find more than one input step
  if (foundSteps.length !== 1) {
    throw new Error(
      `Found ${foundSteps.length} setup transfer input step(s) instead of one, for these criteria: ${JSON.stringify(
        currInstrument
      )}`
    );
  }

  // If we have a setup_transfers_id, there is no next instrument for the user to select
  const inputStep = foundSteps[0];
  if (inputStep.setup_transfers_id) {
    return { transferSetupId: inputStep.setup_transfers_id, instrumentInfo: undefined };
  }

  const nextInputSteps = allInputSteps.filter(
    (step) => step.previous_id === inputStep.id && step.level === inputStep.level + 1
  );

  const instrumentInfo: InstrumentInfo = {
    previousId: inputStep.id,
    designation: inputStep.instrument_designation!,
    allowedInstrumentTypesIds: JsHelper.arrUnique(nextInputSteps.map((step) => step.previous_instrument_types_id!)),
    allowedOwnershipTypesIdsForInstrumentTypes: nextInputSteps.reduce((obj: { [k: number]: number[] }, step) => {
      if (step.previous_instrument_types_id && step.previous_ownership_types_id) {
        if (obj[step.previous_instrument_types_id]) {
          obj[step.previous_instrument_types_id].push(step.previous_ownership_types_id);
        } else {
          obj[step.previous_instrument_types_id] = [step.previous_ownership_types_id];
        }
      }
      return obj;
    }, {}),
  };

  return { transferSetupId: inputStep.setup_transfers_id, instrumentInfo };
}
