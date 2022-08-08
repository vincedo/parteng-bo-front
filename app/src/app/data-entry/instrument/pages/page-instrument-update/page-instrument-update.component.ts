import { Component, Inject } from '@angular/core';
import { BaseComponent } from '@app/core/components';
import { TaskService } from '@app/core/services/task.service';
import { PSEUDO_FOLDER } from '@app/data-entry/models';
import { InstrumentVersion } from '@app/data-entry/models/instrument-version.model';
import { InstrumentService2 } from '@app/data-entry/services/instrument2.service';
import { ProjectService } from '@app/project/services/project.service';
import { GenericDialogService } from '@app/shared/components/generic-dialog/generic-dialog.service';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom, Observable } from 'rxjs';
import { PageInstrumentData, PAGE_INSTRUMENT_DATA, PAGE_INSTRUMENT_PROVIDERS } from '../instrument.provider';

@Component({
  selector: 'parteng-page-instrument-update',
  template: `
    <section *ngIf="data$ | async as data" class="w-[1240px] mx-auto py-6">
      <div class="mb-8">
        <parteng-data-entry-breadcrumb
          *ngIf="data.project"
          [project]="data.project!"
          [breadcrumb]="[
            { label: 'dataEntry.pageInstrumentUpdate.title' | translate: { instrumentName: data.instrument.name } }
          ]"
        ></parteng-data-entry-breadcrumb>
        <!-- If coming from referential -->
        <parteng-breadcrumb
          *ngIf="!data.project"
          [breadcrumb]="[
            { label: 'instruments.featureName' | translate, path: ['/', 'instruments', 'list'] },
            { label: 'dataEntry.pageInstrumentUpdate.title' | translate: { instrumentName: data.instrument.name } }
          ]"
        ></parteng-breadcrumb>
      </div>
      <!-- NAME -->
      <h1 class="ptg-page-title">
        <span class="prefix">{{
          (data.project ? 'dataEntry.featureName' : 'instruments.referential') | translate
        }}</span
        >{{ 'dataEntry.pageInstrumentUpdate.title' | translate: { instrumentName: data.instrument.name } }}
      </h1>
      <parteng-instrument-form-block [title]="'dataEntry.pageInstrumentUpdate.generalInfoBlock.title' | translate">
        <div class="mt-3 text-blue-ptg-primary font-semibold">
          {{ 'dataEntry.pageInstrumentUpdate.generalInfoBlock.instrumentTypeLabel' | translate }}
        </div>
        <div class="font-bold">
          {{ data.instrument.instrumentType?.name }}
        </div>
        <!-- COMMENT -->
        <div class="mt-3  text-blue-ptg-primary font-semibold">
          {{ 'dataEntry.pageInstrumentUpdate.generalInfoBlock.instrumentCommentLabel' | translate }}
          <mat-icon
            *ngIf="canUpdateInstrument(data)"
            class="ml-2 text-neutral-500 cursor-pointer"
            (click)="isEditingComment = true"
            parteng-requires-permission="update"
            parteng-requires-resource="instruments"
            data-testId="instrument-update-button"
            >edit</mat-icon
          >
        </div>
        <div [ngClass]="{ hidden: isEditingComment }">
          {{ data.instrument.comment }}
        </div>
        <mat-form-field [ngClass]="{ hidden: !isEditingComment }" appearance="fill" class="w-full">
          <mat-label>{{ 'dataEntry.pageInstrumentForm.comment.placeHolder' | translate }}</mat-label>
          <textarea #comment matInput [(ngModel)]="data.instrument.comment" class="h-20"></textarea>
        </mat-form-field>
      </parteng-instrument-form-block>

      <!-- VERSIONS LIST -->
      <parteng-instrument-form-block [title]="'dataEntry.pageInstrumentUpdate.versionsBlock.title' | translate">
        <div class="h-[350px]">
          <parteng-instruments-versions-table
            [instrument]="data.instrument"
            (rowClicked)="onSelectInstrumentVersion($event)"
          ></parteng-instruments-versions-table>
        </div>
        <div class="text-sm p-3 rounded mt-3 border min-h-[100px]">
          <div class="text-blue-ptg-primary-800">
            {{ 'dataEntry.pageInstrumentUpdate.changesPlaceholder' | translate }}
            <div *ngIf="selectedVersion" class="text-neutral-700">
              {{ selectedVersion.changes || '-' }}
            </div>
          </div>
        </div>
      </parteng-instrument-form-block>

      <div class="flex justify-end items-baseline mt-8">
        <!-- BACK BUTTON -->
        <button mat-flat-button class="mr-4" (click)="onBack(data)">
          {{ 'dataEntry.pageInstrumentUpdate.buttons.back' | translate }}
        </button>
        <!-- ADD VERSION BUTTON -->
        <button
          *ngIf="data.project"
          [disabled]="!canAddVersion(data)"
          mat-stroked-button
          class="mr-4"
          color="primary"
          parteng-requires-permission="create"
          parteng-requires-resource="instrument-versions"
          routerLink="/data-entry/projects/{{ data.project?.id }}/instruments/{{ data.instrument.id }}/versions/create"
        >
          {{ 'dataEntry.pageInstrumentUpdate.buttons.addVersion' | translate }}
        </button>
        <!-- DELETE INSTRUMENT BUTTON -->
        <button
          *ngIf="!data.readonly"
          [disabled]="!canDeleteInstrument(data)"
          class="mr-4"
          mat-stroked-button
          color="warn"
          (click)="onDeleteInstrumentClick(data)"
          parteng-requires-permission="delete"
          parteng-requires-resource="instruments"
          data-testId="instrument-delete-button"
        >
          {{ 'dataEntry.pageInstrumentUpdate.buttons.deleteInstrument' | translate }}
        </button>
        <!-- GOTO VERSION BUTTON -->
        <button
          [disabled]="!selectedVersion"
          mat-raised-button
          class="mr-4"
          color="primary"
          [routerLink]="
            '/data-entry/projects/' +
            (data.project ? data.project.id : '0') +
            '/instruments/' +
            data.instrument.id +
            '/versions/' +
            (selectedVersion ? selectedVersion.id : '0') +
            '/update'
          "
          [queryParams]="{ readonly: data.readonly }"
          parteng-requires-permission="read"
          parteng-requires-resource="instrument-versions"
          data-testId="show-selected-version-button"
        >
          {{ 'dataEntry.pageInstrumentUpdate.buttons.showVersion' | translate }}
        </button>
        <!-- SAVE COMMENT BUTTON -->
        <button
          [disabled]="!canUpdateInstrument(data)"
          *ngIf="isEditingComment"
          mat-raised-button
          class="mr-4"
          color="primary"
          (click)="onSaveCommentClick(data)"
          parteng-requires-permission="update"
          parteng-requires-resource="instruments"
        >
          {{ 'dataEntry.pageInstrumentUpdate.buttons.update' | translate }}
        </button>
      </div>
    </section>
  `,
  providers: PAGE_INSTRUMENT_PROVIDERS,
})
export class PageInstrumentUpdateComponent extends BaseComponent {
  isEditingComment = false;
  selectedVersion: InstrumentVersion | undefined;

  constructor(
    @Inject(PAGE_INSTRUMENT_DATA) public data$: Observable<PageInstrumentData>,
    private instrumentService: InstrumentService2,
    private translateService: TranslateService,
    private projectService: ProjectService,
    private genericDialogService: GenericDialogService,
    private taskService: TaskService
  ) {
    super();
  }

  canAddVersion(data: PageInstrumentData): boolean {
    return !!data.project && !this.projectService.isProjectValidated(data.project);
  }

  canDeleteInstrument(data: PageInstrumentData): boolean {
    return !data.readonly && (!data.project || !this.projectService.isProjectValidated(data.project));
  }

  canUpdateInstrument(data: PageInstrumentData): boolean {
    return !data.readonly && (!data.project || !this.projectService.isProjectValidated(data.project));
  }

  onSaveCommentClick(data: PageInstrumentData) {
    this.taskService.doSave$(this.instrumentService.updateInstrument(data.instrument));
    this.isEditingComment = false;
  }

  async onDeleteInstrumentClick(data: PageInstrumentData) {
    const confirm = await lastValueFrom(
      this.genericDialogService.binary(
        this.translateService.instant('dataEntry.pageInstrumentUpdate.deleteTitle'),
        this.translateService.instant('dataEntry.pageInstrumentUpdate.deleteDescription', {
          instrumentName: data.instrument.name,
        }),
        this.translateService.instant('dataEntry.pageInstrumentUpdate.deleteYes'),
        this.translateService.instant('dataEntry.pageInstrumentUpdate.deleteNo')
      )
    );
    if (!confirm) {
      return;
    }
    await this.taskService.do(lastValueFrom(this.instrumentService.deleteInstrument(data.instrument)));
    this.onBack(data);
  }

  onSelectInstrumentVersion(instrumentVersion: InstrumentVersion) {
    this.selectedVersion = instrumentVersion;
  }

  // TODO: find a way to go back to the correct folder
  onBack(data: PageInstrumentData) {
    if (data.project) {
      this.router.navigate([
        'data-entry',
        'projects',
        data.project.id,
        'folders',
        PSEUDO_FOLDER.UPDATED_INSTRUMENTS,
        'instruments',
        'list',
      ]);
    } else {
      this.router.navigate(['instruments', 'list']);
    }
  }
}
