import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatRadioChange } from '@angular/material/radio';
import { SettingsService } from '@app/data-entry/services/settings.service';

@Component({
  selector: 'parteng-list-filters',
  template: `
    <div class="flex justify-between items-start">
      <!-- Text Filter -->
      <div class="flex-auto pr-6">
        <mat-form-field appearance="outline" class="w-full">
          <mat-label>{{ 'shared.searchFieldLabel' | translate }}</mat-label>
          <input
            matInput
            [value]="textFilter"
            (input)="onTextFilterChanged($event)"
            cdkFocusInitial
            autocomplete="off"
            data-testId="list-filters-search-text"
          />
          <mat-icon matSuffix class="text-blue-ptg-primary-800">search</mat-icon>
        </mat-form-field>
      </div>

      <!-- Status Filter -->
      <div
        *ngIf="statusFilter !== undefined"
        class="flex-none relative border border-blue-ptg-primary-300 rounded-[10px] h-12 p-3 mt-1"
      >
        <label class="absolute -top-2 left-4 text-xs bg-white px-1">Statut</label>
        <mat-radio-group
          [attr.aria-label]="'shared.statusRadioGroup.ariaLabel' | translate"
          class="flex flex-row text-sm mb-4"
          (change)="onStatusFilterChanged($event)"
        >
          <mat-radio-button
            *ngFor="let radio of statusRadios"
            [value]="radio.value"
            [checked]="radio.value === statusFilter"
            class="mr-4"
            >{{ radio.labelTranslateKey | translate }}</mat-radio-button
          >
        </mat-radio-group>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListFiltersComponent {
  @Input() textFilter: string | undefined = '';
  @Input() statusFilter: number | undefined = -1;

  @Output() textFilterChanged = new EventEmitter<string>();
  @Output() statusFilterChanged = new EventEmitter<number>();

  constructor(private settingsService: SettingsService) {}

  statusRadios: Array<{ value: number; labelTranslateKey: string }> = [
    { value: -1, labelTranslateKey: 'shared.statusRadioGroup.all' },
    {
      value: this.settingsService.get<number>('VALIDATION_STATUS_VALIDATED')!,
      labelTranslateKey: 'shared.statusRadioGroup.validated',
    },
    {
      value: this.settingsService.get<number>('VALIDATION_STATUS_NOT_REVIEWED')!,
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
