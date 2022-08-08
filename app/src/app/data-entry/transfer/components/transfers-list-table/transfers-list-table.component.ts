import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { VALIDATION_STATUS } from '@app/shared/models';
import { TransferItem } from '../../models';

@Component({
  selector: 'parteng-transfers-list-table',
  templateUrl: './transfers-list-table.component.html',
  styleUrls: ['./transfers-list-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TransfersListTableComponent {
  @ViewChild(MatSort) sort!: MatSort;

  @Input() set transferItems(data: TransferItem[]) {
    this.dataSource = new MatTableDataSource<TransferItem>(data);
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }
  @Input() selectedTransferItem: TransferItem | undefined;
  @Input() showFolderColumn = false;

  @Output() rowClicked = new EventEmitter<TransferItem>();

  displayedColumns = [
    'id',
    'date',
    'transferTypeStr',
    'instruments',
    'quantities',
    'persons',
    'source',
    'folder',
    'validation_status',
  ];
  dataSource!: MatTableDataSource<TransferItem>;

  trackTransferById(index: number, transfer: TransferItem): number {
    return transfer.id;
  }

  isValidated(transferItem: TransferItem): boolean {
    return transferItem.validation_status === VALIDATION_STATUS.VALIDATED;
  }

  isSelected(transferItem: TransferItem): boolean {
    return this.selectedTransferItem?.id === transferItem.id;
  }

  clickRow(transferItem: TransferItem): void {
    this.rowClicked.emit(transferItem);
  }
}
