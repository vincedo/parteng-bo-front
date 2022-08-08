/**
 * @file
 * Dialog shown to the user when trying to close a dialog with pending changes.
 *
 * Dialog returns `true` to proceed with the close, `false` to cancel the close.
 */
import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'parteng-dialog-close-warning',
  template: `
    <parteng-dialog-warning
      [title]="'shared.dialogLeaveWarning.title' | translate"
      [text]="dialogLeaveWarningTextTranslateKey || 'shared.dialogLeaveWarning.text' | translate"
    ></parteng-dialog-warning>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogLeaveWarningComponent {
  dialogLeaveWarningTextTranslateKey!: string;

  constructor(@Inject(MAT_DIALOG_DATA) data: any) {
    this.dialogLeaveWarningTextTranslateKey = data?.dialogLeaveWarningTextTranslateKey;
  }
}
