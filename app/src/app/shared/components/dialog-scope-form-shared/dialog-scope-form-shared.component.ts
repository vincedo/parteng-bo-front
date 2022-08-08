import { Component, ChangeDetectionStrategy, ViewChild, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { lastValueFrom, Observable, tap } from 'rxjs';

import { AbstractFormDialogComponent } from '@app/core/components';
import { Scope, World } from '@app/project/models';
import { ScopeForm2Component } from '../scope-form2/scope-form2.component';
import { TaskService } from '@app/core/services/task.service';
import { ScopeService } from '@app/project/services/scope.service';
import { TranslateService } from '@ngx-translate/core';
import { ServicesStore } from '@app/core/store/services.store';
import { GenericDialogService } from '../generic-dialog/generic-dialog.service';
import { WorldService } from '@app/project/services/world.service';

export type DialogScopeForm2Result = Scope;

export interface DialogScopeFormData {
  mode: 'create' | 'view' | 'edit';
  scope: Scope;
  showDeleteButton: boolean;
  fromReferentialScopes: boolean;
}

@Component({
  selector: 'parteng-dialog-scope-form-shared',
  template: `
    <section class="dialog-scope-form-shared">
      <parteng-dialog
        [title]="
          (isNew ? 'project.dialogScopeForm.titleNewScope' : 'project.dialogScopeForm.titleExistingScope') | translate
        "
        [description]="
          isNew && !dialogData.fromReferentialScopes ? ('project.dialogScopeForm.description' | translate) : ''
        "
        [isSubmitDisabled]="isFormInvalid"
        [customDialogActionsHTML]="customDialogActionsHTML"
        (safeClose)="safeCloseDialog()"
      >
        <parteng-scope-form2
          [scope]="dialogData.scope"
          [worlds]="(allWorlds$ | async)!"
          [mode]="mode"
          [backendError]="backendError"
          (modeChanged)="onModeChanged($event)"
          (formSubmitted)="onFormSubmitted($event)"
          (resetBackendError)="onResetBackendError()"
        ></parteng-scope-form2>
        <ng-template #customDialogActionsHTML>
          <mat-dialog-actions class="p-4 pt-2 flex justify-end">
            <button *ngIf="mode === 'view'" type="button" mat-flat-button (click)="closeDialog()">
              {{ 'shared.buttonLabels.goBack' | translate }}
            </button>
            <button *ngIf="mode !== 'view'" type="button" mat-flat-button (click)="closeDialog()">
              {{ 'shared.buttonLabels.cancel' | translate }}
            </button>
            <button
              *ngIf="dialogData.showDeleteButton && mode === 'view'"
              type="button"
              mat-stroked-button
              color="warn"
              (click)="onDeleteScope(dialogData.scope)"
              parteng-requires-permission="delete"
              parteng-requires-resource="scopes"
              data-testId="scope-delete-button"
            >
              {{ 'project.dialogScopeForm.deleteBtn' | translate }}
            </button>
            <button
              *ngIf="mode !== 'view'"
              type="button"
              mat-raised-button
              color="primary"
              (click)="triggerFormSubmit()"
              [disabled]="isFormInvalid"
            >
              {{ 'shared.buttonLabels.validate' | translate }}
            </button>
          </mat-dialog-actions>
        </ng-template>
      </parteng-dialog>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogScopeFormSharedComponent extends AbstractFormDialogComponent<Scope> implements OnInit {
  static readonly DIALOG_ID = 'DIALOG_SCOPE_FORM2';

  @ViewChild(ScopeForm2Component) formComponent!: ScopeForm2Component;

  formState$!: Observable<any>; // @TODO: Remove
  allWorlds$: Observable<World[]> = this.servicesStore.select<World[]>('allWorlds');
  mode!: 'create' | 'view' | 'edit';
  isNew!: boolean;
  backendError: string = '';

  constructor(
    dialogRef: MatDialogRef<DialogScopeFormSharedComponent, DialogScopeForm2Result>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogScopeFormData,
    private scopeService: ScopeService,
    private worldService: WorldService,
    private servicesStore: ServicesStore,
    private translateService: TranslateService,
    private taskService: TaskService,
    private genericDialogService: GenericDialogService,
    private cdr: ChangeDetectorRef
  ) {
    super(dialogRef);
    this.mode = dialogData.mode;
    this.isNew = dialogData.mode === 'create';
  }

  ngOnInit(): void {
    this.servicesStore.dispatch(this.worldService.getAll$(), 'allWorlds');
  }

  async onFormSubmitted(scope?: Scope | undefined) {
    if (!scope) {
      return this.closeDialog(); // this.cancel() ??
    }
    try {
      const scopesByCode = await lastValueFrom(this.scopeService.getScopesByCode$(scope.code));
      if (scopesByCode.length > 0) {
        this.backendError = this.translateService.instant('project.dialogScopeForm.codeAlreadyExists');
        // TODO: use Ngrx component store ?
        this.cdr.detectChanges();
        return;
      }
      const savedScope = await this.taskService.do(lastValueFrom(this.scopeService.saveScope$(scope)), {
        error: this.translateService.instant('shared.saveScope.fail'),
        completed: this.translateService.instant('shared.saveScope.success'),
      });
      this.submitAndCloseDialog(savedScope); // do not use "safe close"
    } catch (e: any) {
      this.backendError = `${e.error.detail}: ${Object.keys(e.error.errors).join(' - ')}`;
    }
  }

  async onDeleteScope(scope: Scope): Promise<void> {
    const confirm = await lastValueFrom(
      this.genericDialogService.binary(
        this.translateService.instant('project.dialogScopeForm.deleteTitle'),
        this.translateService.instant('project.dialogScopeForm.deleteDescription', {
          scopeName: scope.name,
        }),
        this.translateService.instant('project.dialogScopeForm.deleteYes'),
        this.translateService.instant('project.dialogScopeForm.deleteNo')
      )
    );
    if (!confirm) {
      return;
    }
    await this.deleteScope(scope);
  }

  private async deleteScope(scope: Scope): Promise<void> {
    try {
      await this.taskService.do(lastValueFrom(this.scopeService.deleteScope$(scope)), {
        error: this.translateService.instant('shared.deleteScope.fail'),
        completed: this.translateService.instant('shared.deleteScope.success'),
      });
      this._forceDialogClose(); // do not use "safe close"
    } catch (e: any) {
      this.backendError = `${e.error.detail}: ${Object.keys(e.error.errors).join(' - ')}`;
    }
  }

  onModeChanged(mode: 'create' | 'view' | 'edit'): void {
    this.mode = mode;
  }

  onResetBackendError(): void {
    this.backendError = '';
  }
}
