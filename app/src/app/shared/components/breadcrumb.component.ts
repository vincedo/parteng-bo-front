import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { Breadcrumb } from '@app/core/models';

@Component({
  selector: 'parteng-breadcrumb',
  template: `<div
    class="breadcrumb text-xs flex items-center text-blue-ptg-secondary-500"
    data-testId="parteng-breadcrumb"
  >
    <div *ngIf="showHome">
      <a routerLink="/">
        <mat-icon aria-hidden="false" [attr.aria-label]="'shared.breadcrumb.homeIconAriaLabel' | translate"
          >home</mat-icon
        >
      </a>
      <mat-icon aria-hidden="true">keyboard_arrow_right</mat-icon>
    </div>
    <div *ngFor="let fragment of breadcrumb; let isLast = last" class="flex items-center">
      <!-- NB. the following div is required for alignment -->
      <div>
        <ng-container *ngIf="fragment.path">
          <a [routerLink]="fragment.path">{{ fragment.label }}</a>
        </ng-container>
        <ng-container *ngIf="fragment.clickFn && !fragment.path">
          <a href="javascript:void(0)" (click)="fragment.clickFn()">{{ fragment.label }}</a>
        </ng-container>
        <ng-container *ngIf="!fragment.path && !fragment.clickFn">
          <span class="text-black-ptg">{{ fragment.label }}</span>
        </ng-container>
      </div>
      <mat-icon aria-hidden="true" *ngIf="!isLast">keyboard_arrow_right</mat-icon>
    </div>
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BreadcrumbComponent {
  @Input() showHome = true;
  @Input() breadcrumb: Breadcrumb = [];
}
