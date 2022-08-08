import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { GenericDialogService } from '@app/shared/components/generic-dialog/generic-dialog.service';
import { IErrorService } from './task.service';

@Injectable({ providedIn: 'root' })
export class ErrorService implements IErrorService {
  constructor(private genericDialogService: GenericDialogService, private snackBar: MatSnackBar) {}

  async onError(data: any, param: any) {
    let message = data?.error?.detail;
    if (data?.error?.errors) {
      Object.values(data.error.errors).forEach((error) => {
        message += `\n${error}`;
      });
    }
    this.snackBar.open(param, 'ERREUR', {
      duration: 6000,
    });

    // await lastValueFrom(this.genericDialogService.error(param, message).afterClosed());
  }
}
