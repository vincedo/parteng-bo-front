import { Component, Inject } from '@angular/core';
import { GenericDialogData } from './generic-dialog.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'aaag2-generic-dialog',
  template: `
    <div mat-dialog-title>{{ data.title }}</div>
    <div mat-dialog-content>
      <h3 class="content">{{ data.text }}</h3>
    </div>

    <div *ngIf="!!data.choice1 || !!data.choice2" mat-dialog-actions align="center">
      <button *ngIf="!!data.choice1" mat-raised-button color="primary" (click)="close(true)">
        {{ data.choice1 }}
      </button>
      <button *ngIf="!!data.choice2" mat-raised-button color="warn" (click)="close(false)">
        {{ data.choice2 }}
      </button>
    </div>
  `,
  styles: [
    `
      .content {
        white-space: pre-wrap;
      }
    `,
  ],
})
export class GenericDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<GenericDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: GenericDialogData
  ) {}

  close(value: unknown) {
    this.dialogRef.close(value);
  }
}
