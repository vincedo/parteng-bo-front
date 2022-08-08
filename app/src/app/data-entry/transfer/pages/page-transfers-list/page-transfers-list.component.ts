import { Component, ChangeDetectionStrategy, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { BaseComponent } from '@app/core/components';
import {
  DialogProjectSelectorComponent,
  DialogProjectSelectorComponentResult,
} from '@app/project/dialogs/dialog-project-selector/dialog-project-selector.component';
import { DIALOG_WIDTH_LARGE } from '@app/shared/shared.constants';
import { Transfer } from '../../models';

import * as transferActions from '@app/data-entry/transfer/store/transfer.actions';
import * as transferSelectors from '@app/data-entry/transfer/store/transfer.selectors';
import { map, Observable, of } from 'rxjs';

@Component({
  selector: 'parteng-page-transfers-list',
  templateUrl: './page-transfers-list.component.html',
  styleUrls: ['./page-transfers-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTransfersListComponent extends BaseComponent implements OnInit, OnDestroy {
  selectedTransfer: Transfer | undefined;
  transfersListState$ = this.store.select(transferSelectors.selectTransfersListState);
  defaultSelectedTransfer$: Observable<Transfer | undefined> = of(undefined as any);

  constructor(private route: ActivatedRoute, private dialog: MatDialog) {
    super();
  }

  ngOnInit(): void {
    const sub = this.route.parent?.paramMap.subscribe((paramMap) => {
      const projectId = Number(paramMap.get('projectId'));
      const folderId = Number(paramMap.get('folderId'));
      this.store.dispatch(transferActions.loadTransfersList({ projectId, folderId }));
    });
    if (sub) this.addSubscription(sub);

    this.defaultSelectedTransfer$ = this.transfersListState$.pipe(
      map((state) =>
        state.allTransfers.find((t) => t.id === Number(this.route.parent?.snapshot.queryParamMap.get('hlTransfer')))
      )
    );
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  getOpenProjectSelectorFn(): () => void {
    return () => this.openProjectSelector();
  }

  private openProjectSelector(): void {
    this.dialog.open<DialogProjectSelectorComponent, undefined, DialogProjectSelectorComponentResult>(
      DialogProjectSelectorComponent,
      { width: DIALOG_WIDTH_LARGE, height: '90%' }
    );
  }

  onTransferClicked(transfer: Transfer): void {
    this.selectedTransfer = transfer;
  }

  gotoSelectedTransfer(): void {
    if (this.selectedTransfer) {
      this.router.navigate(['..', this.selectedTransfer.id, 'update'], { relativeTo: this.route });
    }
  }
}
