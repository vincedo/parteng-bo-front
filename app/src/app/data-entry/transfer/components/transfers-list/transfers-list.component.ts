import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { JsHelper } from '@app/core/helpers';

import { ProjectLight, FolderLight } from '@app/project/services/project-and-folder-light.service';
import { VALIDATION_STATUS } from '@app/shared/models';
import { Transfer, TransferCategory, TransferItem, transferToTransferItem } from '../../models';

@Component({
  selector: 'parteng-transfers-list',
  templateUrl: './transfers-list.component.html',
  styleUrls: ['./transfers-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransfersListComponent implements OnChanges {
  @Input() parentProject!: ProjectLight;
  @Input() parentFolder!: FolderLight;
  @Input() allTransfers!: Transfer[];
  @Input() selectedTransfer: Transfer | undefined;
  @Input() allTransferCategories!: TransferCategory[];
  @Input() backendError!: string;

  @Output() transferClicked = new EventEmitter<Transfer>();

  allTransferItems: TransferItem[] = [];
  filteredTransferItems: TransferItem[] = [];
  selectedTransferItem: TransferItem | undefined;

  textFilter!: string;
  statusFilter!: number;
  categoriesFilter!: number[];
  sourceFilter!: number;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allTransfers']) {
      this.allTransferItems = this.allTransfers.map((transfer) => transferToTransferItem(transfer));
      this.resetFilters();
    }
    if (changes['selectedTransfer'] && !!this.selectedTransfer) {
      this.selectedTransferItem = this.allTransferItems?.find((t) => t.id === this.selectedTransfer!.id);
    }
  }

  onTransferClicked(transferItem: TransferItem): void {
    const transfer = this.getTransferForTransferItem(transferItem);
    this.transferClicked.emit(transfer);
  }

  onTextFilterChanged(textFilter: string): void {
    this.updateFilteredTransfers({ textFilter });
  }

  onStatusFilterChanged(statusFilter: number): void {
    this.updateFilteredTransfers({ statusFilter });
  }

  onCategoriesFilterChanged(categoriesFilter: number[]): void {
    this.updateFilteredTransfers({ categoriesFilter });
  }

  onSourceFilterChanged(sourceFilter: number): void {
    this.updateFilteredTransfers({ sourceFilter });
  }

  resetFilters(): void {
    this.textFilter = '';
    this.statusFilter = VALIDATION_STATUS.NOT_REVIEWED;
    this.categoriesFilter = this.allTransferCategories.map((transferCategory) => transferCategory.id);
    this.sourceFilter = -1;

    this.updateFilteredTransfers();
  }

  private updateFilteredTransfers(
    filters: { textFilter?: string; statusFilter?: number; categoriesFilter?: number[]; sourceFilter?: number } = {}
  ): void {
    // console.log(`updateFilteredTransfers`, filters);

    this.transferClicked.emit(); // emit "void" to reset the selected transfer

    if (filters.textFilter !== undefined) this.textFilter = filters.textFilter;
    if (filters.statusFilter !== undefined) this.statusFilter = filters.statusFilter;
    if (filters.categoriesFilter !== undefined) this.categoriesFilter = filters.categoriesFilter;
    if (filters.sourceFilter !== undefined) this.sourceFilter = filters.sourceFilter;

    const shouldFilter =
      this.textFilter !== '' ||
      this.statusFilter !== -1 ||
      Array.isArray(this.categoriesFilter) ||
      this.sourceFilter !== -1;

    this.filteredTransferItems = shouldFilter
      ? this.allTransferItems.filter((transfer) =>
          this.filterTransferFn(transfer, {
            textFilter: this.textFilter,
            statusFilter: this.statusFilter,
            categoriesFilter: this.categoriesFilter,
            sourceFilter: this.sourceFilter,
          })
        )
      : [...this.allTransferItems];
  }

  // Return true if the given transfer matches the given filters
  private filterTransferFn(
    transferItem: TransferItem,
    filters: { textFilter?: string; statusFilter?: number; categoriesFilter?: number[]; sourceFilter?: number }
  ): boolean {
    const transferContainsText = filters.textFilter
      ? JsHelper.ObjPropsContainString(transferItem, filters.textFilter, [
          'id',
          'transferTypeStr',
          'instrumentsStr',
          'personsStr',
          'comment',
        ])
      : true;
    const transferMatchesStatus =
      filters.statusFilter !== undefined && filters.statusFilter !== -1
        ? transferItem.validation_status === filters.statusFilter
        : true;
    const transferMatchesCategory = Array.isArray(filters.categoriesFilter)
      ? filters.categoriesFilter.includes(transferItem.transferCategoryId)
      : true;
    const transferMatchesSource =
      filters.sourceFilter !== undefined && filters.sourceFilter !== -1
        ? transferItem.dataSourceId === filters.sourceFilter
        : true;
    return transferContainsText && transferMatchesStatus && transferMatchesCategory && transferMatchesSource;
  }

  private getTransferForTransferItem(transferItem: TransferItem): Transfer {
    return this.allTransfers.find((t) => t.id === transferItem.id)!;
  }
}
