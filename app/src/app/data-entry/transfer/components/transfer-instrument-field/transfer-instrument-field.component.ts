import { Component, ChangeDetectionStrategy, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';

import { Store } from '@ngrx/store';
import { MatSelectChange } from '@angular/material/select';
import { lastValueFrom } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';

import { InstrumentField } from '../../store/instrument-field.state';

import { TransferInstrument } from '../../models';
import { InstrumentService2 } from '@app/data-entry/services/instrument2.service';
import { Instrument2 } from '@app/data-entry/models/instrument.model';

import * as transferActions from '../../store/transfer.actions';

@Component({
  selector: 'parteng-transfer-instrument-field',
  templateUrl: './transfer-instrument-field.component.html',
  styleUrls: ['./transfer-instrument-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TransferInstrumentFieldComponent {
  @Input() index!: number;
  @Input() instrumentField!: InstrumentField;
  @Input() transferInstrument!: TransferInstrument;
  @Input() isEditable = true;
  @Input() isActive!: boolean;

  @Output() activate = new EventEmitter<void>();

  forceOwnershipTypeEditable = false;

  constructor(
    private store: Store,
    private instrumentService: InstrumentService2,
    private translateService: TranslateService
  ) {}

  async clickOpenInstrumentSelector(instrumentIndex: number): Promise<void> {
    this.activate.emit();
    const instruments: Instrument2[] | undefined = await lastValueFrom(
      this.instrumentService.showInstrumentSelectorDialog({
        title: this.translateService.instant('dataEntry.pageTransferForm.dialogInstrumentSelector.title', {
          name: this.instrumentField.instrumentInfo.designation,
        }),
        description: this.translateService.instant('dataEntry.pageTransferForm.dialogInstrumentSelector.description'),
        operation$: this.instrumentService.getInstrumentsByTypes$(
          this.instrumentField.instrumentInfo.allowedInstrumentTypesIds
        ),
      })
    );
    if (instruments) {
      this.store.dispatch(transferActions.submitSelectedInstrument({ instrumentIndex, instrument: instruments[0] }));
    }
  }

  clickSelectOwnershipTypeForInstrument(event: MatSelectChange, instrumentIndex: number): void {
    this.activate.emit();
    this.store.dispatch(
      transferActions.selectOwnershipTypeForInstrument({ instrumentIndex, ownershipTypeId: event.value })
    );
    this.forceOwnershipTypeEditable = false;
  }

  makeOwnershipTypeEditable(): void {
    this.activate.emit();
    this.forceOwnershipTypeEditable = true;
  }
}
