/**
 * @file
 * Dialog used to a show a warning, with customizable text passed via MAT_DIALOG_DATA.
 *
 * Dialog returns `true` to proceed with the close, `false` to cancel the close.
 */
import { Component, ChangeDetectionStrategy, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'parteng-dialog-warning-custom-text',
  template: `
    <parteng-dialog-warning
      [title]="dialogTitleTranslateKey | translate"
      [text]="dialogDescriptionTranslateKey | translate"
    ></parteng-dialog-warning>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogWarningCustomTextComponent {
  dialogTitleTranslateKey!: string;
  dialogDescriptionTranslateKey!: string;

  constructor(@Inject(MAT_DIALOG_DATA) data: any) {
    this.dialogTitleTranslateKey = data.dialogTitleTranslateKey;
    this.dialogDescriptionTranslateKey = data.dialogDescriptionTranslateKey;
  }
}
