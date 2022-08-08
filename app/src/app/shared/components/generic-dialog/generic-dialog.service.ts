import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { GenericDialogComponent } from './generic-dialog.component';

@Injectable({ providedIn: 'root' })
export class GenericDialogService {
  constructor(private dialog: MatDialog) {}

  binary(title: string, text: string, choice1: string, choice2: string): Observable<boolean> {
    const dialogRef = this.dialog.open(GenericDialogComponent, {
      width: '400px',
      data: {
        title,
        text,
        choice1,
        choice2,
        hasClose: false,
      },
    });
    return dialogRef.afterClosed();
  }

  error(title: string, text: string): MatDialogRef<GenericDialogComponent> {
    const dialogRef = this.dialog.open(GenericDialogComponent, {
      width: '600px',
      data: {
        title,
        text,
        hasClose: false,
        choice1: 'OK',
      },
    });
    return dialogRef;
  }
}
