import { Component, ChangeDetectionStrategy, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'parteng-reset-filters-button',
  template: `<div class="border border-blue-ptg-primary-300 rounded-[10px] h-12 p-3 mt-1 flex items-center">
    <button
      mat-icon-button
      (click)="resetFilters.emit()"
      [attr.aria-label]="'shared.resetFiltersAriaLabel' | translate"
    >
      <mat-icon aria-hidden="false" class="text-blue-ptg-primary-500">filter_alt_off</mat-icon>
    </button>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetFiltersButtonComponent {
  @Output() resetFilters = new EventEmitter<void>();
}
