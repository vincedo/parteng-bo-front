import * as _ from 'lodash';

import { JsHelper } from '@app/core/helpers';
import {
  DATA_SOURCE,
  DATA_SOURCE_DEFAULT,
  EntityWithId,
  EntityWithIdDto,
  VALIDATION_STATUS,
  VALIDATION_STATUS_DEFAULT,
} from '@app/shared/models';
import { ProjectLight, FolderLight } from '@app/project/services/project-and-folder-light.service';
import { TransferType } from './transfer-type.model';
import { TransferSetup } from './transfer-setup.model';
import { TransferInstrument, TransferInstrumentDto } from './transfer-instrument.model';
import { TransferPerson, TransferPersonDto } from './transfer-person.model';

export interface TransferDto extends EntityWithIdDto {
  folders_id: number;
  setup_transfers_id: number;
  data_source: DATA_SOURCE;
  date: string;
  validation_status: VALIDATION_STATUS;
  comment: string;

  // frontend props
  parentProject: ProjectLight;
  parentFolder: FolderLight;
  transferType: TransferType; // @KEEP?
  transferSetup: TransferSetup; // @KEEP?
  transferInstruments: TransferInstrument[];
  transferPersons: TransferPerson[];
  duplicateOf: Transfer;
}

export class Transfer extends EntityWithId {
  folders_id: number;
  setup_transfers_id: number;
  data_source: DATA_SOURCE;
  date: string;
  validation_status: VALIDATION_STATUS;
  comment: string | undefined;

  // frontend props
  parentProject: ProjectLight; // parent project in which the transfer is created (for breadcrumb)
  parentFolder: FolderLight; // parent folder in which the transfer is created (for breadcrumb)
  transferType: TransferType;
  transferSetup: TransferSetup;
  transferInstruments: TransferInstrument[];
  transferPersons: TransferPerson[];
  duplicateOf: Transfer | undefined;

  constructor(opts: Partial<TransferDto> = {}) {
    super(opts);

    this.folders_id = opts.folders_id!;
    this.setup_transfers_id = opts.setup_transfers_id!;
    this.data_source = opts.data_source ?? DATA_SOURCE_DEFAULT;
    this.date = opts.date!;
    this.validation_status = opts.validation_status ?? VALIDATION_STATUS_DEFAULT;
    this.comment = opts.comment;

    this.parentProject = opts.parentProject!;
    this.parentFolder = opts.parentFolder!;
    this.transferType = opts.transferType!;
    this.transferSetup = opts.transferSetup!;
    this.transferInstruments = opts.transferInstruments || [];
    this.transferPersons = opts.transferPersons || [];
    this.duplicateOf = opts.duplicateOf;
  }

  clone(opts: Partial<TransferDto> = {}): Transfer {
    const clone = new Transfer({
      ...this.cloneEntityProps(opts),

      folders_id: opts.folders_id || this.folders_id,
      setup_transfers_id: opts.setup_transfers_id || this.setup_transfers_id,
      data_source: opts.data_source !== undefined ? opts.data_source : this.data_source,
      date: opts.date || this.date,
      validation_status: opts.validation_status !== undefined ? opts.validation_status : this.validation_status,
      comment: opts.comment || this.comment,

      parentProject: opts.parentProject || this.parentProject,
      parentFolder: opts.parentFolder || this.parentFolder,
      transferType: opts.transferType || this.transferType,
      transferSetup: opts.transferSetup || this.transferSetup,
      transferInstruments: opts.transferInstruments || [...this.transferInstruments],
      transferPersons: opts.transferPersons || [...this.transferPersons],
      duplicateOf: opts.duplicateOf || this.duplicateOf,
    });

    return clone;
  }

  /**
   * Clone the current transfer as a new transfer (with no transfer.id).
   */
  cloneAsNew(): Transfer {
    const newTransfer = this.resetIdsForTransfInstrumentsAndTransfPersons();
    newTransfer.duplicateOf = this.clone();
    newTransfer.id = undefined!;
    return newTransfer;
  }

  setDate(dateObj: Date): Transfer {
    return this.clone({ date: JsHelper.dateToYMD(dateObj) });
  }

  /**
   * Update the transfer instrument at the given index.
   *
   * @param opts.resetNext If true, then remove all instruments that follow the one that's being updated.
   */
  updateTransfInstrument(
    index: number,
    transferInstrumentDto: Partial<TransferInstrumentDto>,
    opts = { resetNext: false }
  ): Transfer {
    const instruments = opts.resetNext
      ? this.transferInstruments.filter((tInstr, i) => i <= index)
      : [...this.transferInstruments];
    if (instruments[index]) {
      instruments[index] = instruments[index].clone(transferInstrumentDto);
    } else {
      instruments[index] = new TransferInstrument(transferInstrumentDto);
    }
    return this.clone({ transferInstruments: instruments });
  }

  // Update the transfer person at the given index
  updateTransfPerson(index: number, transferPersonDto: Partial<TransferPersonDto>): Transfer {
    const persons = [...this.transferPersons];
    if (persons[index]) {
      persons[index] = persons[index].clone(transferPersonDto);
    } else {
      persons[index] = new TransferPerson(transferPersonDto);
    }
    return this.clone({ transferPersons: persons });
  }

  // Update several transfer persons at once
  updateTransfPersons(
    transfPersonInfos: {
      index: number;
      transferPersonDto: Partial<TransferPersonDto>;
    }[]
  ) {
    let transfer = this.clone();
    for (const { index, transferPersonDto } of transfPersonInfos) {
      transfer = transfer.updateTransfPerson(index, transferPersonDto);
    }
    return transfer;
  }

  private resetIdsForTransfInstrumentsAndTransfPersons(): Transfer {
    const transfer = this.clone();
    transfer.transferInstruments = transfer.transferInstruments.map((ti) =>
      ti.clone({ id: null!, transfers_id: null! })
    );
    transfer.transferPersons = transfer.transferPersons.map((tp) => tp.clone({ id: null!, transfers_id: null! }));
    return transfer;
  }
}

//
// Helper(s)
//

/**
 * Return true if the given transfer is identical to the original.
 */
export function isTransferIdenticalToOriginal(transfer: Transfer): boolean {
  if (transfer.duplicateOf) {
    const original = transfer.duplicateOf;
    // instruments
    const originalTransfInstrumentIds = original.transferInstruments.map((ti) => ti.$instrument.id);
    const transfInstrumentIds = transfer.transferInstruments.map((ti) => ti.$instrument.id);
    const isTransfInstrumentsIdentical = _.isEqual(originalTransfInstrumentIds, transfInstrumentIds);
    // persons
    const originalTransfPersonIds = original.transferPersons.map((tp) => tp.$person.id);
    const transfPersonIds = transfer.transferPersons.map((tp) => tp.$person.id);
    const isTransfPersonsIdentical = _.isEqual(originalTransfPersonIds, transfPersonIds);
    // instrument quantities / amounts
    const isQtyAmountIdentical = transfer.transferInstruments.every((ti, index) =>
      tiQtyAmountIsIdentical(ti, original.transferInstruments[index])
    );
    return (
      transfer.date === original.date &&
      transfer.transferType.id === original.transferType.id &&
      isTransfInstrumentsIdentical &&
      isTransfPersonsIdentical &&
      isQtyAmountIdentical
    );
  }

  return false;
}

function tiQtyAmountIsIdentical(ti1: TransferInstrument, ti2: TransferInstrument): boolean {
  const isEqual = (val1: any, val2: any): boolean => {
    if (!!val1 && !!val2) {
      return val1 === val2; // @TODO: normalize strings? "100" !== "100.00"
    } else if (!val1 && !val2) {
      return true;
    } else {
      return false;
    }
  };

  return (
    isEqual(ti1.input_quantity, ti2.input_quantity) &&
    isEqual(ti1.input_accounting_unit_value, ti2.input_accounting_unit_value) &&
    isEqual(ti1.input_accounting_total_amount, ti2.input_accounting_total_amount) &&
    isEqual(ti1.input_actual_unit_value, ti2.input_actual_unit_value) &&
    isEqual(ti1.input_actual_total_amount, ti2.input_actual_total_amount)
  );
}
