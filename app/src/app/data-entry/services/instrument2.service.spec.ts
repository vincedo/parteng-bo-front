const halApiServiceMock = {};
const settingsServiceMock = {};
const matDialogMock = {};

import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { HalApiService } from '@app/core/services/hal-api.service';
import { InstrumentVersion } from '../models/instrument-version.model';
import { Instrument2 } from '../models/instrument.model';
import { InstrumentService2 } from './instrument2.service';
import { SettingsService } from './settings.service';

describe('InstrumentService', () => {
  let service: InstrumentService2;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: HalApiService, useValue: halApiServiceMock },
        { provide: SettingsService, useValue: settingsServiceMock },
        { provide: MatDialog, useValue: matDialogMock },
      ],
    });
    service = TestBed.inject(InstrumentService2);
    jest.resetAllMocks();
  });

  it('should instantiate', () => {
    expect(service).toBeDefined();
  });

  it('should getFirstVersionBefore', () => {
    expect(service).toBeDefined();
    const version1 = new InstrumentVersion();
    version1.effectiveDate = new Date('2018-01-01');
    const version2 = new InstrumentVersion();
    version2.effectiveDate = new Date('2020-01-01');
    const version3 = new InstrumentVersion();
    version3.effectiveDate = new Date('2010-01-01');
    const instrument = new Instrument2();
    instrument.instrumentVersions = [version1, version2, version3];

    expect(service.getFirstVersionBefore(instrument, new Date('2021-01-02'))).toBe(version2);
    expect(service.getFirstVersionBefore(instrument, new Date('2011-01-02'))).toBe(version3);
    expect(service.getFirstVersionBefore(instrument, new Date('2019-01-02'))).toBe(version1);
    expect(service.getFirstVersionBefore(instrument, new Date('2008-01-02'))).toBe(undefined);
  });
});
