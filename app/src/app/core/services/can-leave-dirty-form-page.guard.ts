/**
 * @file
 * Guard to warn user when they attempt to leave a page containing a dirty form.
 *
 * The guard will only work when applied to a component with these properties:
 *   - safeLeave - True to indicate the guard should be active
 *   - formComponent - A reference to the dumb component holding the form
 */
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanDeactivate, RouterStateSnapshot, UrlTree } from '@angular/router';

import { Observable, of, map } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';

import { DialogLeaveWarningComponent } from '@app/shared/components/dialog-leave-warning.component';
import { DIALOG_WIDTH_MEDIUM } from '@app/shared/shared.constants';

@Injectable({
  providedIn: 'root',
})
export class CanLeaveDirtyFormPageGuard implements CanDeactivate<any> {
  constructor(private dialog: MatDialog) {}

  canDeactivate(
    component: any,
    currentRoute: ActivatedRouteSnapshot,
    currentState: RouterStateSnapshot,
    nextState?: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const getDialogLeaveWarningResult$ = () => {
      const dialogRef = this.dialog.open(DialogLeaveWarningComponent, {
        width: DIALOG_WIDTH_MEDIUM,
        data: { dialogLeaveWarningTextTranslateKey: currentRoute.data['dialogLeaveWarningTextTranslateKey'] },
      });
      return dialogRef.afterClosed().pipe(map((result) => Boolean(result)));
    };
    return component.formComponent.form.dirty && component.safeLeave ? getDialogLeaveWarningResult$() : of(true);
  }
}
