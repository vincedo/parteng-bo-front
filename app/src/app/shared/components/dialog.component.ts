import { Component, ChangeDetectionStrategy, EventEmitter, Output, Input, TemplateRef, OnInit } from '@angular/core';
import { PartengHelper } from '@app/core/helpers';

@Component({
  selector: 'parteng-dialog',
  template: `
    <div class="h-full">
      <!-- Close Button -->
      <div class="flex justify-end">
        <mat-icon
          aria-hidden="false"
          [attr.aria-label]="'shared.dialog.closeAriaLabel' | translate"
          class="text-neutral-500 cursor-pointer"
          (click)="safeClose.emit()"
          data-testId="dialog-close-button"
          >close</mat-icon
        >
      </div>

      <!-- Dialog Scrollable Area -->
      <mat-dialog-content
        class="mat-typography-400"
        [style.height]="buttonsHeight === 'auto' ? '100%' : 'calc(96% - ' + buttonsHeight + ')'"
      >
        <div class="px-4 h-full">
          <!-- Dialog Title & Description -->
          <div [style.height]="headerHeight">
            <h2 mat-dialog-title class="pl-3 border-l-[3px] border-blue-ptg-primary-800" *ngIf="title">
              {{ title }}
            </h2>
            <div class="flex justify-between mt-4 mb-2" *ngIf="description">
              <div class="text-sm mb-2 mr-7" *ngIf="description" [innerHTML]="description"></div>
              <div>
                <ng-content select=".add-item-button"></ng-content>
              </div>
            </div>
          </div>
          <!-- Dialog Content -->
          <ng-content></ng-content>
        </div>
      </mat-dialog-content>

      <!-- Dialog Buttons (default buttons may be overridden with custom HTML) -->
      <mat-dialog-actions
        *ngIf="showDialogButtons && !customDialogActionsHTML"
        class="p-4 pt-2"
        [style.height]="buttonsHeight"
      >
        <div class="w-full" [ngClass]="showSelectButton ? 'grid gap-4 grid-cols-' + buttonsTotalCols : ''">
          <div *ngIf="showSelectButton" class="col-span-{{ buttonsCol1 }} text-right">
            <button
              type="button"
              mat-stroked-button
              (click)="selectHighlighted.emit()"
              [disabled]="isSelectBtnDisabled"
            >
              {{ selectBtnTranslateKey | translate }}
            </button>
          </div>
          <div class="text-right" [ngClass]="showSelectButton ? 'col-span-' + buttonsCol2 : ''">
            <button type="button" mat-flat-button (click)="cancel.emit()">
              {{ cancelBtnTranslateKey | translate }}
            </button>
            <button
              type="button"
              mat-raised-button
              color="primary"
              (click)="submit.emit()"
              [disabled]="isSubmitDisabled"
            >
              {{ submitBtnTranslateKey | translate }}
            </button>
          </div>
        </div>
      </mat-dialog-actions>
      <ng-container *ngIf="customDialogActionsHTML">
        <ng-container *ngTemplateOutlet="customDialogActionsHTML"></ng-container>
      </ng-container>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogComponent implements OnInit {
  @Input() title!: string;
  @Input() description!: string;
  @Input() headerHeight = 'auto'; // fixed header height in pixels, so dialog content height can be 100% - headerHeight
  @Input() buttonsHeight = 'auto'; // fixed buttons height in pixels
  @Input() showDialogButtons = true;
  @Input() isSubmitDisabled = false;
  @Input() showSelectButton = false;
  @Input() isSelectBtnDisabled = true;
  @Input() cancelBtnTranslateKey = 'shared.buttonLabels.cancel';
  @Input() submitBtnTranslateKey = 'shared.buttonLabels.validate';
  @Input() selectBtnTranslateKey = 'shared.buttonLabels.select';

  @Input() customDialogActionsHTML!: TemplateRef<any>;

  @Input() dialogButtonColumnsSplitPoint: string = '4/6';

  @Output() safeClose = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() submit = new EventEmitter<void>();
  @Output() selectHighlighted = new EventEmitter<void>();

  buttonsCol1: number = 1;
  buttonsCol2: number = 1;
  buttonsTotalCols: number = 2;

  ngOnInit(): void {
    if (this.dialogButtonColumnsSplitPoint) {
      const buttonColsInfo = PartengHelper.processColumnsSplitPoint(this.dialogButtonColumnsSplitPoint);
      if (buttonColsInfo) {
        this.buttonsCol1 = buttonColsInfo.col1;
        this.buttonsCol2 = buttonColsInfo.col2;
        this.buttonsTotalCols = buttonColsInfo.totalCols;
      }
    }
  }
}
