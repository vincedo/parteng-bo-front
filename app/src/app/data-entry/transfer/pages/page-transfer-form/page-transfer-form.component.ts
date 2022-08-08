import { Component, OnInit, ChangeDetectionStrategy, ViewChild, OnDestroy } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { MatDialog } from '@angular/material/dialog';

import { BaseComponent } from '@app/core/components';
import {
  DialogProjectSelectorComponent,
  DialogProjectSelectorComponentResult,
} from '@app/project/dialogs/dialog-project-selector/dialog-project-selector.component';
import { DIALOG_WIDTH_LARGE } from '@app/shared/shared.constants';

import { TransferFormComponent } from '../../components/transfer-form/transfer-form.component';
import { TransferType } from '../../models/transfer-type.model';
import { Transfer } from '../../models/transfer.model';

import * as transferActions from '../../store/transfer.actions';
import * as transferSelectors from '../../store/transfer.selectors';

@Component({
  selector: 'parteng-page-transfer-form',
  templateUrl: './page-transfer-form.component.html',
  styleUrls: ['./page-transfer-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTransferFormComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild(TransferFormComponent) formComponent!: TransferFormComponent;

  isNew = true;
  formState$ = this.store.select(transferSelectors.selectTransferFormState);
  projectId!: number;
  folderId!: number;
  safeLeave = true; // If true, warn user when they try to leave on a dirty form

  constructor(private route: ActivatedRoute, private dialog: MatDialog) {
    super();
  }

  ngOnInit(): void {
    const extractIdsFromParamMap = (paramMap: ParamMap) => {
      const projectId = Number(paramMap.get('projectId'));
      const folderId = Number(paramMap.get('folderId'));
      const id = paramMap.get('transferId');
      const transferId = id ? Number(id) : undefined;
      return { projectId, folderId, transferId };
    };

    const sub = this.route.queryParamMap.subscribe((queryParamMap) => {
      const { projectId, folderId, transferId } = extractIdsFromParamMap(this.route.snapshot.paramMap);
      this.projectId = projectId;
      this.folderId = folderId;
      this.isNew = !transferId;
      const transferIdToCopy = Number(queryParamMap.get('copyFrom'));
      this.loadData(transferId, transferIdToCopy);
    });
    this.addSubscription(sub);
  }

  private loadData(transferId?: number, transferIdToCopy?: number): void {
    this.store.dispatch(
      transferActions.loadTransferFormData({
        projectId: this.projectId,
        folderId: this.folderId,
        transferId,
        transferIdToCopy,
      })
    );
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  onDateChanged(date: Date): void {
    this.store.dispatch(transferActions.setTransferDate({ date }));
  }

  onTransferTypeSelected(transferType: TransferType): void {
    this.store.dispatch(transferActions.selectTransferType({ transferType }));
  }

  onFormSubmitted(transfer: Transfer): void {
    this.safeLeave = false;
    this.store.dispatch(transferActions.saveTransfer({ transfer }));
  }

  onSubmitThenDuplicate(transfer: Transfer): void {
    this.safeLeave = false;
    this.store.dispatch(transferActions.saveTransferThenDuplicate({ transfer }));
  }

  onDuplicate(transfer: Transfer): void {
    this.safeLeave = false;
    this.store.dispatch(transferActions.duplicateTransfer({ transfer }));
  }

  onDelete(transfer: Transfer): void {
    if (
      confirm(`Êtes-vous sûr(e) de vouloir supprimer le mouvement "${transfer.date} - ${transfer.transferType.name}" ?`)
    ) {
      this.safeLeave = false;
      this.store.dispatch(transferActions.deleteTransfer({ transfer }));
    }
  }

  onCancel(): void {
    this.store.dispatch(transferActions.cancelTransferForm({ projectId: this.projectId, folderId: this.folderId }));
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
}
