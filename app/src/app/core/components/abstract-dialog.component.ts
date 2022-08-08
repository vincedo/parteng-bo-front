/**
 * @file
 * Abstract class used to create Parteng-friendly dialog components.
 */
import { Component } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { of, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { TypedAction } from '@ngrx/store/src/models';

import { AppInjector } from '@app/app-injector';
import { DialogCloseWarningComponent } from '@app/shared/components/dialog-close-warning.component';
import { DIALOG_WIDTH_MEDIUM } from '@app/shared/shared.constants';

export const DIALOG_RESULT_CLOSE = false;

@Component({ template: '' })
export abstract class AbstractDialogComponent<R = any> {
  protected dialogRef: MatDialogRef<AbstractDialogComponent<R>, R | typeof DIALOG_RESULT_CLOSE>;
  private dialog: MatDialog;
  private dialogSub!: Subscription;
  private _originalClose!: (result: R | typeof DIALOG_RESULT_CLOSE | undefined) => void;

  protected asyncDialogClosedAction!: TypedAction<string>;
  protected store: Store;

  /**
   * Whether the dialog has pending changes that could be lost when closing.
   *
   * Accessor is to keep the value readonly.
   */
  private _isDirty = false;
  get isDirty(): boolean {
    return this._isDirty;
  }

  /**
   * NB. The dialogRef must be passed manually from the child component
   * cause we can't inject it manually with AppInjector.getInjector().
   */
  constructor(dialogRef: MatDialogRef<AbstractDialogComponent<R>, R | typeof DIALOG_RESULT_CLOSE>) {
    this.dialogRef = dialogRef;
    const injector = AppInjector.getInjector();
    this.dialog = injector.get(MatDialog);
    this.store = injector.get(Store);
    this.setupSafeClose();
  }

  /**
   * Force-close the dialog, e.g. when clicking Cancel.
   *
   * The fact that we're passing a value (false) instead of `undefined`
   * as a result is used as an indicator that the close is intentional.
   */
  closeDialog(): void {
    this.dialogRef.close(DIALOG_RESULT_CLOSE);
    this.dispatchCloseAction();
  }

  /**
   * Safe-close the dialog, e.g. when clicking on the backdrop or Esc key.
   *
   * The fact that we're passing `undefined` as a result
   * is used as an indicator that the close is UNintentional.
   */
  safeCloseDialog(): void {
    this.dialogRef.close();
    this.dispatchCloseAction();
  }

  /**
   * Close the dialog while submitting a result.
   */
  submitAndCloseDialog(result: R): void {
    this.dialogRef.close(result);
  }

  private dispatchCloseAction(): void {
    if (this.asyncDialogClosedAction) {
      this.dialogRef.afterClosed().subscribe(() => this.store.dispatch(this.asyncDialogClosedAction));
    }
  }

  protected markAsDirty(): void {
    this._isDirty = true;
  }

  //
  // ----- Safe Close Feature -----
  //

  // Hijack MatDialog's original close method
  private setupSafeClose(): void {
    this._originalClose = this.dialogRef.close;
    this.dialogRef.close = this._doSafeClose.bind(this);
  }

  // Close dialog by calling original close, aka dialogRef.close()
  _forceDialogClose(dialogResult?: R): void {
    if (this.dialogSub) {
      this.dialogSub.unsubscribe();
    }
    this._originalClose.bind(this.dialogRef)(dialogResult);
  }

  // Overload for the original close method:
  //   - If we have a dialogResult, the close is intentional and the dialog is closed.
  //   - If dialogResult is undefined and the comp is dirty, warn the user.
  _doSafeClose(dialogResult?: R): void {
    const showWarningAndPromptResponse = () => {
      const dialogRef = this.dialog.open(DialogCloseWarningComponent, { width: DIALOG_WIDTH_MEDIUM });
      return dialogRef.afterClosed().pipe(map((ret) => Boolean(ret)));
    };

    const getConfirm$ = this._isDirty && dialogResult === undefined ? showWarningAndPromptResponse() : of(true);

    this.dialogSub = getConfirm$.subscribe((confirmed) => {
      if (confirmed) {
        this._forceDialogClose(dialogResult);
      }
    });
  }
}
