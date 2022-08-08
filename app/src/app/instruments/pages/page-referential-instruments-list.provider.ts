import { InjectionToken, Provider } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Instrument2 } from '@app/data-entry/models/instrument.model';
import { InstrumentService2 } from '@app/data-entry/services/instrument2.service';
import { map, Observable } from 'rxjs';

export interface PageReferentialInstrumentsListData {
  instruments: Instrument2[];
}

export const PAGE_REFERENTIAL_INSTRUMENTS_LIST_DATA = new InjectionToken<PageReferentialInstrumentsListData>(
  'PAGE_REFERENTIAL_INSTRUMENTS_LIST_DATA'
);

export const PAGE_REFERENTIAL_INSTRUMENTS_LIST_PROVIDERS: Provider[] = [
  {
    provide: PAGE_REFERENTIAL_INSTRUMENTS_LIST_DATA,
    deps: [ActivatedRoute, InstrumentService2],
    useFactory: pageReferentialInstrumentsListFactory,
  },
];

export function pageReferentialInstrumentsListFactory(
  route: ActivatedRoute,
  instrumentService: InstrumentService2
): Observable<PageReferentialInstrumentsListData> {
  return instrumentService.getAll$().pipe(
    map((instruments) => ({
      instruments: [...instruments].sort((a, b) => a.instrumentType!.order - b.instrumentType!.order || a.id - b.id),
    }))
  );
}
