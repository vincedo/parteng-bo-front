import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';

import { MatRadioChange } from '@angular/material/radio';

import { Options } from '../models';

@Component({
  selector: 'parteng-multi-radios-filter-field',
  template: `<div class="relative border border-blue-ptg-primary-300 rounded-[10px] h-12 p-3 mt-1">
    <label class="absolute -top-2 left-4 text-xs bg-white px-1">
      {{ label }}
    </label>
    <mat-radio-group
      [attr.aria-label]="'shared.statusRadioGroup.ariaLabel' | translate"
      class="flex flex-row text-sm mb-4"
      (change)="onStatusFilterChanged($event)"
    >
      <mat-radio-button
        *ngFor="let option of options"
        [value]="option.value"
        [checked]="option.value === value"
        class="mr-4"
        >{{ option.labelTranslateKey | translate }}</mat-radio-button
      >
    </mat-radio-group>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiRadiosFilterFieldComponent {
  @Input() value!: number;
  @Input() options!: Options;
  @Input() label!: string;
  @Input() ariaLabel!: string;

  @Output() valueChanged = new EventEmitter<number>();

  onStatusFilterChanged(event: MatRadioChange): void {
    this.valueChanged.emit(event.value);
  }
}
