import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { BaseComponent } from '@app/core/components';
import { JsHelper } from '@app/core/helpers';
import { Scope } from '@app/project/models';
import { combineLatest, map, Observable, of, startWith } from 'rxjs';

@Component({
  selector: 'parteng-scopes-list',
  template: `
    <div class="h-full flex flex-col">
      <form [formGroup]="textFilterForm">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>{{ 'shared.searchFieldLabel' | translate }}</mat-label>
          <input
            matInput
            formControlName="textFilter"
            cdkFocusInitial
            autocomplete="off"
            data-testId="scopes-search-text"
          />
          <mat-icon matSuffix class="text-blue-ptg-primary-800">search</mat-icon>
        </mat-form-field>
      </form>

      <div class="flex-auto overflow-y-auto" *ngIf="filteredScopes$ | async as filteredScopes">
        <parteng-scopes-table
          [scopes]="filteredScopes"
          [selectedScope]="selectedScope"
          (rowClicked)="onScopeClicked($event)"
        ></parteng-scopes-table>
      </div>
      <div class="text-sm p-3 rounded mt-3 border min-h-[100px]">
        <div class="text-blue-ptg-primary-800">
          {{ 'scopes.pageScopesList.detailsAreaTitle' | translate }}
          <div *ngIf="selectedScope" class="text-neutral-700 my-2">
            {{ selectedScope.comment || '-' }}<br />
            <span class="font-bold">{{ 'scopes.pageScopesList.detailsAreaWorlds' | translate }} :</span>
            {{ stringifyScopeWorlds(selectedScope) }}
          </div>
        </div>
      </div>
    </div>
  `,
})
export class ScopesListComponent extends BaseComponent implements OnInit, OnChanges {
  @Input() scopes: Scope[] = [];
  @Input() selectedScope: Scope | undefined;

  @Output() scopeSelected = new EventEmitter<Scope>();

  textFilterForm!: FormGroup;
  filteredScopes$: Observable<Scope[]> | undefined;
  textFilter$: Observable<string> = of('');

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {
    super();
  }

  ngOnInit(): void {
    this.textFilterForm = this.fb.group({ textFilter: [''] });
    this.textFilter$ = this.textFilterForm.valueChanges.pipe(
      startWith(undefined),
      map((textFilter) => textFilter?.textFilter || '')
    );
    this.update();
  }

  ngOnChanges(): void {
    this.textFilterForm?.reset();
    this.update();
  }

  update() {
    const normalize = (str: string) => JsHelper.strNormalize(str, { trim: true, lowercase: true, removeAccents: true });
    this.filteredScopes$ = combineLatest([of(this.scopes), this.textFilter$]).pipe(
      map(([scopes, textFilter]) => {
        return (scopes || []).filter((scope) => {
          return (
            normalize(scope.code || '').includes(normalize(textFilter)) ||
            normalize(scope.name || '').includes(normalize(textFilter)) ||
            normalize(scope.historicalName || '').includes(normalize(textFilter)) ||
            normalize(scope.city || '').includes(normalize(textFilter)) ||
            normalize(scope.comment || '').includes(normalize(textFilter))
          );
        });
      })
    );
  }

  onScopeClicked(scope: Scope) {
    this.selectedScope = scope;
    this.scopeSelected.emit(scope);
    this.cdr.detectChanges();
  }

  stringifyScopeWorlds(scope: Scope): string {
    return scope.worlds.map((w) => w.name).join(', ');
  }
}
