import { Component, EventEmitter, forwardRef, Input, Output } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'parteng-datepicker',
  template: `
    <div *ngIf="!value || isEditing; else result">
      <mat-form-field appearance="outline" (click)="picker.open()">
        <mat-label>{{ label }}</mat-label>
        <input
          [ngModel]="value"
          matInput
          [matDatepicker]="picker"
          autocomplete="off"
          [readonly]="readonly"
          [disabled]="disabled"
          [required]="required"
          [min]="min"
          (dateChange)="onChange($event)"
        />
        <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>
    </div>
    <ng-template #result>
      <div class="mb-3">
        <div class="text-blue-ptg-primary">
          {{ label }}
          <mat-icon *ngIf="!disabled" class="ml-2 text-neutral-500 cursor-pointer" (click)="isEditing = true"
            >edit</mat-icon
          >
        </div>
        <div class="font-bold">
          {{ value | date: 'dd/MM/yyyy' }}
        </div>
      </div>
    </ng-template>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PartengDatePickerComponent),
      multi: true,
    },
  ],
})
export class PartengDatePickerComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() readonly: boolean = true;
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() min: string | undefined;

  @Output() dateChange = new EventEmitter<any>();

  value: any;
  isEditing = false;

  writeValue(value: any): void {
    this.value = value;
  }

  onChange(event: any) {
    this.propagateChange(event.value);
    this.dateChange.emit(event);
  }

  propagateChange = (_: any) => undefined;
  registerOnChange(fn: any) {
    this.propagateChange = fn;
  }

  onTouched = (_: any) => undefined;
  registerOnTouched(fn: any) {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
