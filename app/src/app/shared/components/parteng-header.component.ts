import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { EnvironmentInfo } from '@app/core/models';

@Component({
  selector: 'parteng-header',
  template: `<header *ngIf="envInfo" class="parteng-header bg-blue-ptg-primary text-white flex flex-row items-center">
    <div class="px-7">
      <a routerLink="/">
        <img width="109" src="./assets/images/parteng_logo.png" alt="Logo Parteng" />
      </a>
    </div>
    <div class="border-l-2 border-white pl-6 text-white text-base">
      {{ envInfo.envName }}
    </div>
    <div class="relative">
      <mat-icon
        aria-hidden="false"
        [attr.aria-label]="'shared.header.infoIconAriaLabel' | translate"
        class="cursor-pointer pt-2 ml-3 text-[#DADADA]"
        (mouseenter)="showTooltip()"
        (mouseleave)="hideTooltip()"
        >info_outline</mat-icon
      >
      <div
        class="absolute left-3 w-[180px] h-[70px] p-3 text-xs text-blue-ptg-primary bg-[#E6EAEF] rounded drop-shadow-md"
        [class.invisible]="!isTooltipOpen"
      >
        <span class="font-semibold">{{ 'shared.header.versionAndCommitHashes' | translate }}</span
        ><br />
        Front : {{ envInfo.frontVersion }} - {{ envInfo.frontCommitHash }}<br />
        API : {{ envInfo.apiVersion }} - {{ envInfo.apiCommitHash }}<br />
      </div>
    </div>
  </header>`,
  styles: [
    `
      @use '/src/styles/variables' as v;
      .parteng-header {
        height: v.$parteng-site-header-height;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PartengHeaderComponent {
  // @ViewChild(MatMenuTrigger) tooltipTrigger!: MatMenuTrigger;

  @Input() envInfo: EnvironmentInfo = {
    envName: 'Development',
    frontVersion: '0.1.0',
    frontCommitHash: 'dsfdy',
    apiVersion: '0.3.0',
    apiCommitHash: 'aaass',
  };

  isTooltipOpen = false;

  showTooltip(): void {
    if (!this.isTooltipOpen) {
      // this.tooltipTrigger.openMenu();
      this.isTooltipOpen = true;
    }
  }

  hideTooltip(): void {
    if (this.isTooltipOpen) {
      // this.tooltipTrigger.closeMenu();
      this.isTooltipOpen = false;
    }
  }
}
