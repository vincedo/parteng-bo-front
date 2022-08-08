import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AttributeType } from '@app/data-entry/models/attribute-type.model';

// TODO: make it a real control with ControlValueAccessor
@Component({
  selector: 'parteng-attribute-selectionable-control',
  template: `
    <div *ngIf="isNew && !control.value">
      <ng-container *ngIf="!control.value">
        <button type="button" mat-stroked-button (click)="select.emit()">
          {{ attributeType.name }}
          <span *ngIf="!attributeType.nullable">*</span>
        </button>
      </ng-container>
    </div>
    <ng-container *ngIf="control.value">
      <div class="text-blue-ptg-primary font-semibold mb-3">
        {{ attributeType.name }}
        <mat-icon
          *ngIf="isNew || (attributeType.modifiable && !readonly)"
          class="ml-2 text-neutral-500 cursor-pointer"
          (click)="select.emit()"
          >edit</mat-icon
        >
      </div>
      <ng-content></ng-content>
    </ng-container>
  `,
})
export class AttributeSelectionableControlComponent {
  @Input() isNew = false;
  @Input() readonly = false;
  @Input() attributeType!: AttributeType;
  @Input() control!: FormControl;

  @Output() select = new EventEmitter<void>();
}
