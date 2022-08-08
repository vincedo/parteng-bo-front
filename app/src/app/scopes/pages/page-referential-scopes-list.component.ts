import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';

import { lastValueFrom, Observable } from 'rxjs';

import { BaseComponent } from '@app/core/components';
import { ServicesStore } from '@app/core/store/services.store';
import { Scope } from '@app/project/models';
import { ScopeService } from '@app/project/services/scope.service';
import {
  PageReferentialScopesListData,
  PAGE_REFERENTIAL_SCOPES_LIST_DATA,
  PAGE_REFERENTIAL_SCOPES_LIST_PROVIDERS,
} from './page-referential-scopes-list.provider';

const STATE_KEY = 'referentialScopesData';

@Component({
  selector: 'parteng-page-referential-scopes-list',
  template: `
    <section *ngIf="scopesData$ | async as data" class="page-referential-scopes-list w-[1240px] h-full mx-auto">
      <!-- Header -->
      <div class="page-header">
        <div class="my-4">
          <parteng-page-title [title]="'scopes.pageScopesList.breadcrumbTitle' | translate"></parteng-page-title>
          <parteng-breadcrumb
            [breadcrumb]="[{ label: 'scopes.pageScopesList.breadcrumbTitle' | translate }]"
          ></parteng-breadcrumb>
        </div>

        <div class="flex justify-between">
          <div class="flex-auto">
            <h1 class="text-lg font-semibold pl-4 border-l-[3px] border-blue-ptg-primary-800">
              {{ 'scopes.pageScopesList.title' | translate }}
            </h1>
            <div class="mb-4" [innerHTML]="'scopes.pageScopesList.description' | translate"></div>
          </div>
          <div class="flex-none">
            <button
              type="button"
              mat-stroked-button
              color="primary"
              (click)="showNewScopeDialog()"
              parteng-requires-permission="create"
              parteng-requires-resource="scopes"
              data-testId="create-scope-button"
            >
              {{ 'scopes.pageScopesList.createNewScopeBtn' | translate }}
            </button>
          </div>
        </div>
      </div>

      <!-- Content -->
      <div class="h-[680px]">
        <parteng-scopes-list [scopes]="data.scopes" (scopeSelected)="selectedScope = $event"></parteng-scopes-list>
      </div>

      <!-- Footer -->
      <div class="page-footer flex items-center justify-end mt-3">
        <div>
          <button
            type="button"
            mat-raised-button
            color="primary"
            (click)="showSelectedScopeDialog(selectedScope!, data)"
            [disabled]="!selectedScope"
            parteng-requires-permission="read"
            parteng-requires-resource="scopes"
            data-testId="show-selected-scope-button"
          >
            {{ 'scopes.pageScopesList.footer.viewBtn' | translate }}
          </button>
        </div>
      </div>
    </section>
  `,
  providers: PAGE_REFERENTIAL_SCOPES_LIST_PROVIDERS,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageReferentialScopesListComponent extends BaseComponent implements OnInit {
  scopesData$: Observable<PageReferentialScopesListData> = this.servicesStore.select(STATE_KEY);
  selectedScope: Scope | undefined;

  constructor(
    @Inject(PAGE_REFERENTIAL_SCOPES_LIST_DATA) public data$: Observable<PageReferentialScopesListData>,
    private scopeService: ScopeService,
    private servicesStore: ServicesStore
  ) {
    super();
  }

  ngOnInit(): void {
    this.servicesStore.dispatch(this.data$, STATE_KEY);
  }

  async showSelectedScopeDialog(selectedScope: Scope, data: PageReferentialScopesListData) {
    const canDeleteScope = true; // @TODO: fetch user permission from backend
    await lastValueFrom(
      this.scopeService.showScopeDialog({
        mode: 'view',
        scope: this.selectedScope,
        showDeleteButton: canDeleteScope,
        fromReferentialScopes: true,
      })
    );
    this.servicesStore.dispatch(this.data$, STATE_KEY);
  }

  async showNewScopeDialog() {
    await lastValueFrom(
      this.scopeService.showScopeDialog({
        mode: 'create',
        showDeleteButton: false,
        fromReferentialScopes: true,
      })
    );
    this.servicesStore.dispatch(this.data$, STATE_KEY);
  }
}
