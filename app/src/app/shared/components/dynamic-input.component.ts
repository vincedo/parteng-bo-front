import { Component, Input } from '@angular/core';

@Component({
  selector: 'parteng-dynamic-input',
  template: `
    <ng-container *ngIf="mode === 'editable'">
      <span class="mt-3 text-xs text-blue-ptg-primary font-semibold">{{ label }}</span>
      <mat-icon
        *ngIf="!readonly"
        class="ml-2 text-neutral-500 cursor-pointer"
        (click)="isEditing = true"
        data-testid="dynamic-input-edit-button"
        >edit</mat-icon
      >
      <div *ngIf="!isEditing" class="mb-5">
        {{ displayValue }}
      </div>
    </ng-container>
    <ng-container *ngIf="mode === 'input' || isEditing"> <ng-content></ng-content> </ng-container>
  `,
})
export class DynamicInputComponent {
  @Input() label: string = '';
  @Input() displayValue: unknown = '';
  @Input() mode: 'editable' | 'input' = 'input';
  @Input() readonly = false;

  isEditing = false;
}
