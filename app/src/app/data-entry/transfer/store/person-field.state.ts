import * as _ from 'lodash';

import { PersonQuality } from '@app/data-entry/models/person-quality.model';
import { Transfer, TransferSetupPerson } from '../models';

export interface PersonField {
  personQualityId: number;
  personQualityStr: string;
}

/**
 * Create the expected number of person fields based on the given transfer's transferSetup info.
 *
 * Note that the selected persons will be saved directly in the "transfer.transferPersons" property,
 * and not in these fields, which are only here to support building the form.
 */
export function createPersonFieldsForTransfer(
  transfer: Transfer,
  opts: { allPersonQualities: PersonQuality[] }
): PersonField[] {
  if (transfer.transferSetup) {
    return _.sortBy(transfer.transferSetup.setupPersons, 'person_number').map((tSetupPerson) =>
      personFieldCreateFromTransferSetupPerson(tSetupPerson, opts)
    );
  } else {
    return [];
  }
}

function personFieldCreateFromTransferSetupPerson(
  tSetupPerson: TransferSetupPerson,
  opts: { allPersonQualities: PersonQuality[] }
): PersonField {
  const personField: PersonField = {
    personQualityId: tSetupPerson.person_qualities_id,
    personQualityStr: opts.allPersonQualities.find((pQuality) => pQuality.id === tSetupPerson.person_qualities_id)!
      .name,
  };
  return personField;
}

/**
 * Update a person field in the given list of person fields.
 */
export function personFieldUpdateInList(
  personFields: PersonField[],
  index: number,
  personField: PersonField
): PersonField[] {
  const personFieldsCopy = [...personFields];
  personFieldsCopy[index] = { ...personFields[index], ...personField };
  return personFieldsCopy;
}

/**
 * Return true if the number of person fields equals the number of transfer.transferPersons,
 * which means the user has selected a person for each person field.
 */
export function isPersonFieldsCompleteForTransfer(personFields: PersonField[], transfer: Transfer): boolean {
  return personFields.length === transfer.transferPersons.length && personFields.length !== 0;
}
