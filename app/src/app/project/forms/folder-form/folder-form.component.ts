import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output, OnInit } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';

import { AbstractFormComponent } from '@app/core/components';
import { Folder, Scope, StandardFolder2 } from '@app/project/models';
import { JsHelper } from '@app/core/helpers';
import { RelFolderToScope } from '@app/project/models/rel-folder-to-scope';

@Component({
  selector: 'parteng-folder-form',
  templateUrl: './folder-form.component.html',
  styleUrls: ['./folder-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FolderFormComponent extends AbstractFormComponent<Folder> implements OnInit {
  @Input() folder!: Folder;
  @Input() isNew!: boolean;
  @Input() existingFolderNames!: string[];
  @Input() allStandardFolders: StandardFolder2[] = [];
  // @Input() set allStandardFolders(folders: StandardFolder2[]) {
  //   this.standardFolderNames = folders.map((f) => f.name);
  // }

  @Output() scopesChanged = new EventEmitter<void>();

  // standardFolderNames!: string[];
  filteredFolders$!: Observable<StandardFolder2[]>;
  hoveredStandardFolder: StandardFolder2 | undefined;

  get isScopesInvalid(): boolean {
    const control = this.form?.get('scopes');
    return control ? control.invalid : false;
  }

  buildForm(): void {
    const existingFolderNames = this.isNew
      ? this.existingFolderNames
      : this.existingFolderNames.filter((name) => name !== this.folder.name);
    this.form = this.fb.group({
      name: [this.folder.name, [Validators.required, uniqueNameValidator(existingFolderNames)]],
      comment: [this.folder.comment],
      scopes: [this.folder.relFolderToScopes.map((rel) => rel.scope), atLeastOneScopeSelectedValidator],
    });
    this.setupNameAutocomplete();
  }

  serializeForm(): Folder {
    const formData = this.form!.value;

    const folder = this.folder.clone({
      name: formData.name,
      comment: formData.comment,
      scopes: formData.scopes,
    });

    return folder;
  }

  onSelectedScopesChanged(scopes: Scope[]): void {
    this.form.get('scopes')!.setValue(scopes);

    // without this, the parent dialog doesn't see the form has become dirty...
    this.scopesChanged.emit();
  }

  onFolderMouseOver(_: unknown, standardFolder?: StandardFolder2): void {
    this.hoveredStandardFolder = standardFolder;
  }

  extractFolderScopes(relFolderToScopes: RelFolderToScope[]): Scope[] {
    return relFolderToScopes.map((rel) => rel.scope);
  }

  //
  // private
  //

  private setupNameAutocomplete(): void {
    this.filteredFolders$ = this.form.get('name')!.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  private _filter(value: string): StandardFolder2[] {
    return this.allStandardFolders.filter((standardFolder) => JsHelper.strContainsStr(standardFolder.name, value));
  }
}

//
//
//

function uniqueNameValidator(existingNames: string[]): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const error = control.value !== undefined && existingNames.includes(control.value);
    return error ? { nameAlreadyExists: true } : null;
  };
}

function atLeastOneScopeSelectedValidator(control: AbstractControl): ValidationErrors | null {
  const error = control.value !== undefined && control.value.length === 0;
  return error ? { noScopeSelected: true } : null;
}
