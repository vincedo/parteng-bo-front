import { Component, ChangeDetectionStrategy, Inject, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { AbstractFormDialogComponent } from '@app/core/components';
import { FolderFormComponent } from '@app/project/forms/folder-form/folder-form.component';
import { Folder, StandardFolder2 } from '@app/project/models';

export type DialogFolderFormResult = Folder;

export interface DialogFolderFormData {
  folder: Folder;
  isNew: boolean;
  allStandardFolders: StandardFolder2[];
  existingProjectFolderNames: string[];
}

@Component({
  selector: 'parteng-dialog-folder-form',
  templateUrl: './dialog-folder-form.component.html',
  styleUrls: ['./dialog-folder-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogFolderFormComponent extends AbstractFormDialogComponent<Folder> {
  @ViewChild(FolderFormComponent) formComponent!: FolderFormComponent;

  formState$!: Observable<any>; // @TODO: Remove

  constructor(
    dialogRef: MatDialogRef<DialogFolderFormComponent, DialogFolderFormResult>,
    @Inject(MAT_DIALOG_DATA) public dialogData: DialogFolderFormData
  ) {
    super(dialogRef);
  }

  onFolderScopesChanged(): void {
    this.markAsDirty();
  }

  onFormSubmitted(folder: Folder): void {
    this.submitAndCloseDialog(folder);
  }
}
