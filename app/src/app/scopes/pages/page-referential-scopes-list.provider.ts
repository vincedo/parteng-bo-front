import { InjectionToken, Provider } from '@angular/core';

import { map, Observable, tap } from 'rxjs';

import { Scope } from '@app/project/models';
import { ScopeService } from '@app/project/services/scope.service';

export interface PageReferentialScopesListData {
  scopes: Scope[];
}

export const PAGE_REFERENTIAL_SCOPES_LIST_DATA = new InjectionToken<PageReferentialScopesListData>(
  'PAGE_REFERENTIAL_SCOPES_LIST_DATA'
);

export const PAGE_REFERENTIAL_SCOPES_LIST_PROVIDERS: Provider[] = [
  {
    provide: PAGE_REFERENTIAL_SCOPES_LIST_DATA,
    deps: [ScopeService],
    useFactory: pageReferentialScopesListFactory,
  },
];

export function pageReferentialScopesListFactory(
  scopeService: ScopeService
): Observable<PageReferentialScopesListData> {
  return scopeService.getAll$().pipe(
    // tap((SCOPES) => console.log(`LOADED SCOPES`, SCOPES)),
    map((scopes) => ({
      scopes,
    }))
  );
}
