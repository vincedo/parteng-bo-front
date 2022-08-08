/**
 * @file
 * Dialog shown to the user when trying to close a dialog with pending changes.
 *
 * Dialog returns `true` to proceed with the close, `false` to cancel the close.
 */
import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'parteng-dialog-close-warning',
  template: `
    <parteng-dialog-warning
      [title]="'shared.dialogCloseWarning.title' | translate"
      [text]="'shared.dialogCloseWarning.text' | translate"
    ></parteng-dialog-warning>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogCloseWarningComponent {}
