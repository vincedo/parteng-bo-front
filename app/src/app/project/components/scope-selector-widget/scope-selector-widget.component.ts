import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, OnDestroy, OnInit } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';

import { lastValueFrom, Subscription } from 'rxjs';

import { Scope } from '@app/project/models';
import { ScopeService } from '@app/project/services/scope.service';

@Component({
  selector: 'parteng-scope-selector-widget',
  templateUrl: './scope-selector-widget.component.html',
  styleUrls: ['./scope-selector-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ScopeSelectorWidgetComponent implements OnInit, OnDestroy {
  @Input() initialScopes!: Scope[];
  @Output() selectedScopesChanged = new EventEmitter<Scope[]>();

  scopes!: Scope[];
  scopesWithCheckboxChecked!: Scope[]; // list of scopes that are actually selected (checkbox checked)

  private dialogSub!: Subscription;

  constructor(private scopeService: ScopeService) {}

  ngOnInit(): void {
    this.scopes = [...this.initialScopes];
    this.scopesWithCheckboxChecked = [...this.initialScopes];
  }

  ngOnDestroy(): void {
    if (this.dialogSub) this.dialogSub.unsubscribe();
  }

  //

  toggleScopeCheckbox(ev: MatCheckboxChange): void {
    const scopeId = Number(ev.source.value);
    if (ev.checked) {
      this.scopesWithCheckboxChecked = [...this.scopesWithCheckboxChecked, this.scopes.find((s) => s.id === scopeId)!];
    } else {
      this.scopesWithCheckboxChecked = this.scopesWithCheckboxChecked.filter((s) => s.id !== scopeId);
    }
    this.emitSelectedScopes();
  }

  isScopeCheckboxChecked(scope: Scope): boolean {
    return this.scopesWithCheckboxChecked.some((s) => s.id === scope.id);
  }

  async clickOpenScopeSelector(): Promise<void> {
    const scopes: Scope[] | undefined = await lastValueFrom(
      this.scopeService.showScopeSelectorDialog({
        title: 'project.dialogScopeSelector.titleAddScopesToFolder',
        selectedScopes: this.scopesWithCheckboxChecked,
        hideAddItemButton: true,
      })
    );
    if (scopes) {
      this.onScopesFromSelectorChanged(scopes);
    }
  }

  /**
   *
   * @param scopesFromSelector List of ALL scopes that the user has selected in the scope selector.
   *                           NB. "selected" does not mean "checked" in the UI.
   */
  private onScopesFromSelectorChanged(scopesFromSelector: Scope[]): void {
    // deleted scopes -- remove them from checked scopes
    const scopeIdsFromSelector = scopesFromSelector.map((s) => s.id);
    const deletedScopes = this.scopes.filter((s) => !scopeIdsFromSelector.includes(s.id));
    this.scopesWithCheckboxChecked = this.scopesWithCheckboxChecked.filter(
      (scope) => !deletedScopes.find((s) => s.id === scope.id)
    );
    // added scopes -- add them to checked scopes automatically
    const previousScopeIds = this.scopes.map((s) => s.id);
    const addedScopes = scopesFromSelector.filter((s) => !previousScopeIds.includes(s.id));
    this.scopesWithCheckboxChecked = [...this.scopesWithCheckboxChecked, ...addedScopes];
    // update UI
    this.scopes = [...scopesFromSelector];
    this.emitSelectedScopes();
  }

  private emitSelectedScopes(): void {
    this.selectedScopesChanged.emit(this.scopesWithCheckboxChecked);
  }
}
