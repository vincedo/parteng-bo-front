import { Component, ChangeDetectionStrategy } from '@angular/core';

export type DialogProjectScopesChangedWarningResult = boolean;

@Component({
  selector: 'parteng-dialog-project-scopes-changed-warning',
  template: `
    <parteng-dialog-warning
      [title]="'project.dialogProjectScopesChangedWarning.title' | translate"
      [text]="'project.dialogProjectScopesChangedWarning.text' | translate"
      [customDialogActionsHTML]="customDialogActionsHTML"
    >
      <ng-template #customDialogActionsHTML>
        <mat-dialog-actions align="center" class="flex flex-col">
          <button mat-button [mat-dialog-close]="false">
            {{ 'project.dialogProjectScopesChangedWarning.understoodBtn' | translate }}
          </button>
          <button mat-raised-button color="primary" [mat-dialog-close]="true" cdkFocusInitial>
            {{ 'project.dialogProjectScopesChangedWarning.goEditFoldersBtn' | translate }}
          </button>
        </mat-dialog-actions>
      </ng-template>
    </parteng-dialog-warning>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogProjectScopesChangedWarningComponent {}
