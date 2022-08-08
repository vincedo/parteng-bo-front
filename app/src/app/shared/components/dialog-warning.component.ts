/**
 * @file
 * Generic dialog for all warnings.
 * Dialog returns `true` to proceed with the close, `false` to cancel the close.
 */
import { Component, ChangeDetectionStrategy, Input, TemplateRef } from '@angular/core';

@Component({
  selector: 'parteng-dialog-warning',
  template: `
    <div class="flex justify-end">
      <mat-icon
        aria-hidden="false"
        [attr.aria-label]="'shared.dialog.closeAriaLabel' | translate"
        [mat-dialog-close]="false"
        class="text-neutral-500 cursor-pointer"
        >close</mat-icon
      >
    </div>

    <div class="w-[500px] mx-auto py-16">
      <h1 mat-dialog-title class="text-center text-2xl font-semibold">
        {{ title }}
      </h1>
      <div mat-dialog-content class="flex flex-col items-center">
        <div class="border-t border-neutral-500 w-[280px] pb-4"></div>
        <p class="text-base font-semibold text-center" [innerHTML]="text"></p>
        <div class="border-t border-neutral-500 w-[280px] pb-4"></div>
      </div>
      <mat-dialog-actions *ngIf="!customDialogActionsHTML" align="center" class="flex flex-col">
        <button mat-button [mat-dialog-close]="false">{{ 'shared.buttonLabels.cancel' | translate }}</button>
        <button mat-raised-button color="primary" [mat-dialog-close]="true" cdkFocusInitial>
          {{ 'shared.buttonLabels.confirm' | translate }}
        </button>
      </mat-dialog-actions>
      <ng-container *ngIf="customDialogActionsHTML">
        <ng-container *ngTemplateOutlet="customDialogActionsHTML"></ng-container>
      </ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogWarningComponent {
  @Input() title!: string;
  @Input() text!: string;
  @Input() customDialogActionsHTML!: TemplateRef<any>;
}
