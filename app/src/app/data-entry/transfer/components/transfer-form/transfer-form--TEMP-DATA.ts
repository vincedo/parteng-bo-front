/**
 * @file
 * Temporary data to test transfer form instrument.
 */
import { InstrumentLight } from '@app/data-entry/models';

import { TransferSetupInstrument, OwnershipType, TransferInstrument } from '../../models';

export const TRANSFER_SETUP_INSTRUMENTS_TEMP: TransferSetupInstrument[] = [
  new TransferSetupInstrument({
    status: 1,
    created: 1644566683,
    updated: 1644566683,
    id: 518,
    setup_transfers_id: 393,
    instrument_types_id: 1,
    instrument_number: 1,
    ownership_types_id: 1,
    instrument_designation: 'instrument avant',
    input_designation_quantity: 'nombre de titres',
    input_designation_accounting_unit_value: 'valeur nominale unitaire',
    input_designation_accounting_total_amount: 'montant nominal total',
    input_designation_actual_unit_value: undefined,
    input_designation_actual_total_amount: undefined,
    input_fixed_value_accounting_total_amount: undefined,
    input_fixed_value_accounting_unit_value: undefined,
    input_fixed_value_actual_unit_value: undefined,
    input_fixed_value_quantity: 1,
    input_fixed_value_actual_total_amount: undefined,
  }),
  new TransferSetupInstrument({
    status: 1,
    created: 1644566683,
    updated: 1644566683,
    id: 519,
    setup_transfers_id: 393,
    instrument_types_id: 2,
    instrument_number: 2,
    ownership_types_id: 2,
    instrument_designation: 'instrument après',
    input_designation_quantity: 'nombre de titres',
    input_designation_accounting_unit_value: 'valeur nominale unitaire',
    input_designation_accounting_total_amount: 'montant nominal total',
    input_designation_actual_unit_value: undefined,
    input_designation_actual_total_amount: undefined,
    input_fixed_value_accounting_total_amount: undefined,
    input_fixed_value_accounting_unit_value: undefined,
    input_fixed_value_actual_unit_value: undefined,
    input_fixed_value_quantity: undefined,
    input_fixed_value_actual_total_amount: undefined,
  }),
];

export const TRANSFER_INSTRUMENTS_TEMP: TransferInstrument[] = [
  new TransferInstrument({
    instruments_id: 2,
    $instrument: new InstrumentLight({
      status: 1,
      created: 1644566382,
      updated: 1644566382,
      id: 2,
      instrument_types_id: 2,
      comment: 'Commentaire baleine',
      name: 'AO [NC0034]',
    }),
    $ownershipType: new OwnershipType({
      status: 1,
      created: 1644566365,
      updated: 1644566365,
      id: 2,
      name: 'Nue-Propriété Seulement',
      short_name: 'NP',
      order: 2,
    }),
  }),
  new TransferInstrument({
    instruments_id: 1,
    $instrument: new InstrumentLight({
      status: 1,
      created: 1644566382,
      updated: 1644566382,
      id: 1,
      instrument_types_id: 1,
      comment: 'Commentaire hippocampe',
      name: 'PS [NC0034]',
    }),
    $ownershipType: new OwnershipType({
      status: 1,
      created: 1644566365,
      updated: 1644566365,
      id: 1,
      name: 'Pleine Propriété',
      short_name: 'PP',
      order: 1,
    }),
  }),
];
