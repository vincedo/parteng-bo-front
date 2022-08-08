import {
  Component,
  ChangeDetectionStrategy,
  Input,
  EventEmitter,
  Output,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

import { Subscription } from 'rxjs';

import { JsHelper } from '@app/core/helpers';
import { Options } from '../models';

@Component({
  selector: 'parteng-multi-checkboxes-filter-field',
  template: `<div
    *ngIf="checkboxes"
    [formGroup]="checkboxes"
    class="relative border border-blue-ptg-primary-300 rounded-[10px] h-12 p-3 mt-1"
  >
    <label class="absolute -top-2 left-4 text-xs bg-white px-1">
      {{ label }}
    </label>
    <mat-checkbox *ngFor="let option of options" [formControlName]="option.value" class="mr-4">
      {{ option.labelTranslateKey | translate }}
    </mat-checkbox>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiCheckboxesFilterFieldComponent implements OnChanges, OnDestroy {
  @Input() value!: number[];
  @Input() options!: Options;
  @Input() label!: string;
  @Input() ariaLabel!: string;

  @Output() valueChanged = new EventEmitter<number[]>();

  checkboxes!: FormGroup;

  private sub!: Subscription;

  constructor(private fb: FormBuilder) {}

  ngOnChanges(changes: SimpleChanges): void {
    const optionsChanged = changes['options'] && !changes['options'].firstChange;
    const valueChanged = changes['value'] && !changes['value'].firstChange;
    const rebuildCheckboxes =
      (optionsChanged || valueChanged) && Array.isArray(this.options) && Array.isArray(this.value);
    if (rebuildCheckboxes) {
      this.buildCheckboxesField();
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private buildCheckboxesField(): void {
    const fbGroupDefinition: { [key: string]: boolean } = {};
    for (const option of this.options) {
      fbGroupDefinition[option.value] = this.value.includes(option.value);
    }
    this.checkboxes = this.fb.group(fbGroupDefinition);
    if (this.sub) this.sub.unsubscribe();
    this.sub = this.checkboxes.valueChanges.subscribe((val) => {
      const activeCheckboxes = JsHelper.objGetKeysTrue(val).map((id) => Number(id));
      this.valueChanged.emit(activeCheckboxes);
    });
  }
}
