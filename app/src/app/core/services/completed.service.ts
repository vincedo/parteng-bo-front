import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ICompletedService } from './task.service';

@Injectable({ providedIn: 'root' })
export class CompletedService implements ICompletedService {
  constructor(private snackBar: MatSnackBar) {}

  onCompleted(data: any, param: any): void {
    this.snackBar.open(param || 'SUCCESS', '', {
      duration: 3000,
    });
  }
}
