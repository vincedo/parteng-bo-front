import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';

import { from, of } from 'rxjs';
import { map, catchError, mergeMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';

import { TransferService, TransferSetupService, TransferFormDataService } from '../services';

import * as coreActions from '@app/core/store/core.actions';
import * as transferActions from './transfer.actions';
import * as transferSelectors from './transfer.selectors';

@Injectable()
export class TransferEffects {
  //
  // ----- Transfers List -----
  //

  loadTransfersList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(transferActions.loadTransfersList),
      mergeMap(({ projectId, folderId }) =>
        this.transferService.getAllForProject$({ projectId, folderId }).pipe(
          // tap((DATA) => console.log(`loadTransfersList.success`, DATA)),
          map(({ allTransfers, allTransferCategories, project, folder }) =>
            transferActions.loadTransfersListSuccess({ allTransfers, allTransferCategories, project, folder })
          ),
          catchError((error: HttpErrorResponse) => of(transferActions.loadTransfersListError({ error })))
        )
      )
    );
  });

  //
  // ----- Transfer Form -----
  //

  loadTransferFormData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(transferActions.loadTransferFormData),
      mergeMap(({ projectId, folderId, transferId, transferIdToCopy }) =>
        this.transferFormDataService.getData$({ projectId, folderId, transferId, transferIdToCopy }).pipe(
          // tap(({ transfer }) => console.log(`LOADED TRANSFER`, transfer)),
          map(
            ({
              transfer,
              transferTypes,
              instruments,
              instrumentTypes,
              personQualities,
              ownershipTypes,
              setupTransferInputSteps,
              persons,
            }) =>
              transferActions.loadTransferFormDataSuccess({
                transfer,
                transferTypes,
                instruments,
                instrumentTypes,
                personQualities,
                ownershipTypes,
                setupTransferInputSteps,
                persons,
              })
          ),
          catchError((error: HttpErrorResponse) => of(transferActions.loadTransferFormDataError({ error })))
        )
      )
    );
  });

  saveTransfer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(transferActions.saveTransfer),
      mergeMap(({ transfer }) =>
        this.transferService.save$(transfer).pipe(
          map((savedTransfer) => transferActions.saveTransferSuccess({ transfer: savedTransfer })),
          catchError((error: HttpErrorResponse) => of(transferActions.saveTransferError({ error })))
        )
      )
    );
  });

  redirectToTransfersListAfterSave$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(transferActions.saveTransferSuccess),
      map(({ transfer }) =>
        this.router.navigate(
          [
            '/data-entry',
            'projects',
            transfer.parentProject.id,
            'folders',
            transfer.parentFolder.id,
            'transfers',
            'list',
          ],
          { queryParams: { hlTransfer: transfer.id } }
        )
      ),
      map(() =>
        coreActions.openSnackbar({ message: this.translate.instant('dataEntry.pageTransferForm.transferWasSaved') })
      )
    );
  });

  deleteTransfer$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(transferActions.deleteTransfer),
      mergeMap(({ transfer }) =>
        this.transferService.delete$(transfer).pipe(
          map((transfer) => transferActions.deleteTransferSuccess({ transfer })),
          catchError((error: HttpErrorResponse) => of(transferActions.deleteTransferError({ error })))
        )
      )
    );
  });

  redirectToTransfersListAfterDelete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(transferActions.deleteTransferSuccess),
      map(({ transfer }) =>
        this.router.navigate([
          '/data-entry',
          'projects',
          transfer.parentProject.id,
          'folders',
          transfer.parentFolder.id,
          'transfers',
          'list',
        ])
      ),
      map(() =>
        coreActions.openSnackbar({ message: this.translate.instant('dataEntry.pageTransferForm.transferWasDeleted') })
      )
    );
  });

  cancelTransferForm$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(transferActions.cancelTransferForm),
      mergeMap(({ projectId, folderId }) =>
        from(this.router.navigate(['/data-entry', 'projects', projectId, 'folders', folderId, 'transfers', 'list']))
      ),
      map((navigationSucceeded) =>
        navigationSucceeded ? transferActions.cancelTransferFormSuccess() : coreActions.noOp()
      )
    );
  });

  //
  // ----- Duplicate Transfer -----
  //

  duplicateTransfer$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(transferActions.duplicateTransfer),
        map(({ transfer }) =>
          this.router.navigate(
            [
              '/data-entry',
              'projects',
              transfer.parentProject.id,
              'folders',
              transfer.parentFolder.id,
              'transfers',
              'create',
            ],
            { queryParams: { copyFrom: transfer.id } }
          )
        )
      );
    },
    { dispatch: false }
  );

  saveTransferThenDuplicate$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(transferActions.saveTransferThenDuplicate),
      mergeMap(({ transfer }) =>
        this.transferService.save$(transfer).pipe(
          map((savedTransfer) => transferActions.duplicateTransfer({ transfer: savedTransfer })),
          catchError((error: HttpErrorResponse) => of(transferActions.saveTransferError({ error })))
        )
      )
    );
  });

  //
  // ----- Instrument Selector & Form -----
  //

  /**
   * If there is only one ownership type for the instrument that was just selected,
   * then select this ownership type automatically.
   */
  submitSelectedInstrument$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(transferActions.submitSelectedInstrument),
      concatLatestFrom(() => this.store.select(transferSelectors.selectTransferFormState)),
      map(([{ instrumentIndex }, transferFormState]) => {
        const allowedOwnershipTypes = transferFormState.instrumentFields[instrumentIndex].allowedOwnershipTypes;
        return allowedOwnershipTypes.length === 1
          ? transferActions.selectOwnershipTypeForInstrument({
              instrumentIndex,
              ownershipTypeId: allowedOwnershipTypes[0].id,
            })
          : coreActions.noOp();
      })
    );
  });

  //
  // ----- Select OwnershipType for Transfer Instrument -----
  //

  /**
   * If a transfer setup id exists after the user has selected the instrument's ownership type,
   * it means the list of instruments for the transfer is now complete
   * and we can load the transfer setup details and create the person fields.
   */
  selectOwnershipTypeForInstrument$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(transferActions.selectOwnershipTypeForInstrument),
      concatLatestFrom(() => this.store.select(transferSelectors.selectTransferFormState)),
      map(([action, transferFormState]) =>
        transferFormState.transfer.setup_transfers_id
          ? transferActions.loadTransferSetup({ transferSetupId: transferFormState.transfer.setup_transfers_id })
          : coreActions.noOp()
      )
    );
  });

  //
  // ----- Load Transfer Setup Data -----
  //

  loadTransferSetup$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(transferActions.loadTransferSetup),
      mergeMap(({ transferSetupId }) =>
        this.transferSetupService.getById$(transferSetupId).pipe(
          // tap((transferSetup) => console.log('----- Transfer Setup LOADED', transferSetup)),
          map((transferSetup) =>
            transferActions.loadTransferSetupSuccess({
              transferSetup,
            })
          ),
          catchError((error: HttpErrorResponse) => of(transferActions.loadTransferSetupError({ error })))
        )
      )
    );
  });

  //
  // ----- Spinner -----
  //

  showSpinner$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(transferActions.loadTransferFormData),
      map(() => coreActions.showSpinner())
    );
  });

  hideSpinner$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(transferActions.loadTransferFormDataSuccess, transferActions.loadTransferFormDataError),
      map(() => coreActions.hideSpinner())
    );
  });

  //

  constructor(
    private actions$: Actions,
    private store: Store,
    private router: Router,
    private translate: TranslateService,
    private transferService: TransferService,
    private transferFormDataService: TransferFormDataService,
    private transferSetupService: TransferSetupService
  ) {}
}
