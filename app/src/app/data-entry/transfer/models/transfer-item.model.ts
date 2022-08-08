/**
 * @file
 * A transfer as displayed in the main transfers list.
 * Some properties have been modified to facilitate display and/or filtering.
 */
import * as _ from 'lodash';

import { DATA_SOURCE, VALIDATION_STATUS } from '@app/shared/models';
import { Transfer } from './transfer.model';
import { TransferInstrument } from '.';

export interface TransferItem {
  id: number;
  date: string;
  transferTypeStr: string;
  transferCategoryId: number;
  instruments: { designation: string; name: string }[];
  instrumentsStr: string; // for filtering -- all instrument names as a comma-separated string
  persons: { personQualityId: number; name: string }[];
  personsStr: string; // for filtering -- all person names as a comma-separated string
  quantities: { designation: string; value: string }[];
  dataSourceId: DATA_SOURCE;
  dataSourceStr: string;
  validation_status: VALIDATION_STATUS;
  comment: string;
  parentFolderName: string;
}

export function transferToTransferItem(transfer: Transfer): TransferItem {
  const sortedTransferInstruments = _.sortBy(transfer.transferInstruments, 'instrument_number');
  const sortedTransferPersons = _.sortBy(transfer.transferPersons, 'person_number');

  const transfInstrumentGetDesignationQuantity = (transfInstrument: TransferInstrument) =>
    transfer.transferSetup.setupInstruments.find(
      (setupInstr) => setupInstr.instrument_number === transfInstrument.instrument_number
    )!.input_designation_quantity;
  // Return true if the given transfer instrument has a designation for the quantity input
  const transfInstrumentHasDesignationQuantity = (transfInstrument: TransferInstrument) =>
    !!transfInstrumentGetDesignationQuantity(transfInstrument);

  const item: TransferItem = {
    id: transfer.id,
    date: transfer.date,
    transferTypeStr: transfer.transferType.name,
    transferCategoryId: transfer.transferType.transfer_categories_id,
    instruments: sortedTransferInstruments.map((transfInstrument) => ({
      designation: transfer.transferSetup.setupInstruments.find(
        (setupInstr) => setupInstr.instrument_number === transfInstrument.instrument_number
      )!.instrument_designation,
      name: transfInstrument.$instrument.name,
    })),
    instrumentsStr: transfer.transferInstruments.map((transfInstrument) => transfInstrument.$instrument.name).join(','),
    persons: sortedTransferPersons.map((transfPerson) => ({
      personQualityId: transfer.transferSetup.setupPersons.find(
        (setupPerson) => setupPerson.person_number === transfPerson.person_number
      )!.person_qualities_id,
      name: transfPerson.$person.name,
    })),
    personsStr: transfer.transferPersons.map((transfPerson) => transfPerson.$person.name).join(','),
    quantities: sortedTransferInstruments.filter(transfInstrumentHasDesignationQuantity).map((transfInstrument) => ({
      designation: transfInstrumentGetDesignationQuantity(transfInstrument)!,
      value: `${Number(transfInstrument.quantity)}`,
    })),
    dataSourceId: transfer.data_source,
    dataSourceStr: dataSourceToStr(transfer.data_source),
    validation_status: transfer.validation_status,
    comment: transfer.comment!,
    parentFolderName: transfer.parentFolder?.name,
  };
  return item;
}

function dataSourceToStr(dataSource: DATA_SOURCE): string {
  switch (dataSource) {
    case DATA_SOURCE.MANUAL_ENTRY:
      return 'Manuelle';
    case DATA_SOURCE.SCHEDULE_V1:
      return 'Echéancier';
    case DATA_SOURCE.INITIAL_IMPORT:
      return 'Import initial';
  }
}
