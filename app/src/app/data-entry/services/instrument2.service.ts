import { Injectable } from '@angular/core';

import { map, Observable, throwError } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { HalApiService } from '@app/core/services/hal-api.service';
import {
  DialogInstrumentSelectorSharedComponent,
  DialogInstrumentSelectorSharedParams,
} from '@app/shared/components/dialog-instrument-selector-shared/dialog-instrument-selector-shared.component';
import { DIALOG_WIDTH_MEDIUM } from '@app/shared/shared.constants';
import { InstrumentType, PSEUDO_FOLDER } from '../models';
import { InstrumentVersion } from '../models/instrument-version.model';
import { Instrument2 } from '../models/instrument.model';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class InstrumentService2 {
  constructor(
    private halApiService: HalApiService,
    private settingsService: SettingsService,
    private dialog: MatDialog
  ) {}

  newInstrument(comment: string, instrumentType: InstrumentType, instrumentVersions: InstrumentVersion[]): Instrument2 {
    const instrument = new Instrument2();
    instrument.name = '';
    instrument.comment = comment;
    instrument.status = this.settingsService.get<number>('STATUS_ACTIVE')!;
    instrument.instrumentTypeId = instrumentType.id;
    instrument.instrumentVersions = instrumentVersions;
    return instrument;
  }

  getAll$(): Observable<Instrument2[]> {
    return this.halApiService.getCollection$(Instrument2, '/instruments', { sets: 'full' }, 'instruments');
  }

  getInstrumentById(instrumentId: number): Observable<Instrument2> {
    return this.halApiService.getOne$<Instrument2>(Instrument2, `/instruments/${instrumentId}`, { sets: 'full' });
  }

  getInstrumentsByPseudoFolder$(
    projectId: number,
    folderId: PSEUDO_FOLDER.UPDATED_INSTRUMENTS | PSEUDO_FOLDER.REFERENCED_INSTRUMENTS
  ): Observable<Instrument2[]> {
    if (folderId === PSEUDO_FOLDER.UPDATED_INSTRUMENTS) {
      return this.halApiService.getCollection$(
        Instrument2,
        '/instruments',
        { projects_id: projectId.toString(), sets: 'full' },
        'instruments'
      );
    }
    if (folderId === PSEUDO_FOLDER.REFERENCED_INSTRUMENTS) {
      return this.halApiService.getCollection$(
        Instrument2,
        '/instruments',
        { projects_id: projectId.toString(), has_at_least_one_transfer_in_project: '1', sets: 'full' },
        'instruments'
      );
    }
    return throwError(() => new Error(`InstrumentService2.getInstrumentsByFolder$: Unknown folder ${folderId}`));
  }

  getInstrumentsByTypes$(instrumentTypesIds: number[]): Observable<Instrument2[]> {
    return this.getAll$().pipe(
      map((allInstruments) => allInstruments.filter((instr) => instrumentTypesIds.includes(instr.instrumentTypeId)))
    );
  }

  getFirstVersionBefore(instrument: Instrument2, date: Date): InstrumentVersion | undefined {
    return instrument.instrumentVersions
      ?.sort((b, a) => a.effectiveDate!.getTime() - b.effectiveDate!.getTime())
      .find((version) => version.effectiveDate!.getTime() < date.getTime())!;
  }

  saveInstrument(instrument: Instrument2) {
    return this.halApiService.postOne$<Instrument2>('/instruments', {}, instrument);
  }

  updateInstrument(instrument: Instrument2) {
    return this.halApiService.putOne$<Instrument2>(`/instruments/${instrument.id}`, {}, instrument);
  }

  deleteInstrument(instrument: Instrument2) {
    return this.halApiService.deleteOne$<Instrument2>(`/instruments/${instrument.id}`);
  }

  showInstrumentSelectorDialog(opts: {
    title: string;
    description: string;
    operation$?: Observable<Instrument2[]>;
  }): Observable<Instrument2[]> {
    return this.dialog
      .open<DialogInstrumentSelectorSharedComponent, DialogInstrumentSelectorSharedParams>(
        DialogInstrumentSelectorSharedComponent,
        {
          width: DIALOG_WIDTH_MEDIUM,
          data: opts,
        }
      )
      .afterClosed();
  }
}
