import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';

import { VALIDATION_STATUS } from '@app/shared/models';

@Component({
  selector: 'parteng-projects-list-filters',
  templateUrl: './projects-list-filters.component.html',
  styleUrls: ['./projects-list-filters.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsListFiltersComponent {
  @Input() textFilter = '';
  @Input() statusFilter = -1;

  @Output() textFilterChanged = new EventEmitter<string>();
  @Output() statusFilterChanged = new EventEmitter<number>();

  statusRadios: Array<{ value: number; labelTranslateKey: string }> = [
    { value: -1, labelTranslateKey: 'shared.statusRadioGroup.all' },
    { value: VALIDATION_STATUS.VALIDATED, labelTranslateKey: 'shared.statusRadioGroup.validated' },
    {
      value: VALIDATION_STATUS.NOT_REVIEWED,
      labelTranslateKey: 'shared.statusRadioGroup.notValidated',
    },
  ];

  onTextFilterChanged(event: Event): void {
    this.textFilterChanged.emit((event.target as HTMLInputElement).value);
  }

  onStatusFilterChanged(event: MatRadioChange): void {
    this.statusFilterChanged.emit(event.value);
  }
}
