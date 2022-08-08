import {
  Component,
  ChangeDetectionStrategy,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  OnChanges,
} from '@angular/core';

import { DATA_SOURCE, Options, VALIDATION_STATUS } from '@app/shared/models';
import { TransferCategory } from '../../models';

@Component({
  selector: 'parteng-transfers-list-filters',
  templateUrl: './transfers-list-filters.component.html',
  styleUrls: ['./transfers-list-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransfersListFiltersComponent implements OnChanges {
  @Input() textFilter = '';
  @Input() statusFilter = -1;
  @Input() sourceFilter = -1;
  @Input() categoriesFilter: number[] = [];
  @Input() allTransferCategories!: TransferCategory[];

  @Output() textFilterChanged = new EventEmitter<string>();
  @Output() statusFilterChanged = new EventEmitter<number>();
  @Output() categoriesFilterChanged = new EventEmitter<number[]>();
  @Output() sourceFilterChanged = new EventEmitter<number>();
  @Output() resetFilters = new EventEmitter<void>();

  statusOptions: Options = [
    { value: -1, labelTranslateKey: 'shared.statusRadioGroup.all' },
    { value: VALIDATION_STATUS.VALIDATED, labelTranslateKey: 'shared.statusRadioGroup.validated' },
    {
      value: VALIDATION_STATUS.NOT_REVIEWED,
      labelTranslateKey: 'shared.statusRadioGroup.notValidated',
    },
  ];
  sourceOptions: Options = [
    { value: -1, labelTranslateKey: 'dataEntry.pageTransfersList.transferSourceRadioGroup.all' },
    {
      value: DATA_SOURCE.MANUAL_ENTRY,
      labelTranslateKey: 'dataEntry.pageTransfersList.transferSourceRadioGroup.manualEntry',
    },
    {
      value: DATA_SOURCE.SCHEDULE_V1,
      labelTranslateKey: 'dataEntry.pageTransfersList.transferSourceRadioGroup.schedule',
    },
  ];
  transferCategoryOptions!: Options;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allTransferCategories'] && Array.isArray(this.allTransferCategories)) {
      this.transferCategoryOptions = this.allTransferCategories.map((category) => ({
        value: category.id,
        labelTranslateKey: category.name,
      }));
    }
  }

  onTextFilterChanged(event: Event): void {
    this.textFilterChanged.emit((event.target as HTMLInputElement).value);
  }

  onStatusFilterChanged(value: number): void {
    this.statusFilterChanged.emit(value);
  }

  onCategoriesFilterChanged(value: number[]): void {
    this.categoriesFilterChanged.emit(value);
  }

  onSourceFilterChanged(value: number): void {
    this.sourceFilterChanged.emit(value);
  }

  onResetFilters(): void {
    this.resetFilters.emit();
  }
}
