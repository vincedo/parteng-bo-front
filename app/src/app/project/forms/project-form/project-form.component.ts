import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { Validators } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

import { lastValueFrom, Observable } from 'rxjs';
import { Store } from '@ngrx/store';

import { AbstractFormComponent } from '@app/core/components';
import { Folder, Goal, Project, ProjectTemplate2, Scope, StandardFolder2 } from '@app/project/models';
import { PROJECT_ORDINARY } from '@app/project/models/project-ordinary.enum';
import { ScopeService } from '@app/project/services/scope.service';
import { ProjectFormSectionsState } from '@app/project/store/project-form-state-helper';
import { VALIDATION_STATUS } from '@app/shared/models';
import { ProjectIdentification } from '@app/project/models/project-identification.model';
import { RelProjectToGoal } from '@app/project/models/rel-project-to-goal';
import { DIALOG_WIDTH_MEDIUM, DIALOG_WIDTH_SMALL } from '@app/shared/shared.constants';
import { MatDialog } from '@angular/material/dialog';
import {
  DialogGoalEnricherComponent,
  DialogGoalEnricherData,
} from '@app/project/dialogs/dialog-goal-enricher/dialog-goal-enricher.component';
import {
  DialogFolderFormComponent,
  DialogFolderFormData,
} from '@app/project/dialogs/dialog-folder-form/dialog-folder-form.component';
import { FolderService } from '@app/project/services/folder.service';
import { ProjectFormBlockComponent } from '@app/project/components/project-form-block/project-form-block.component';

import * as projectFormActions from '@app/project/store/project-form.actions';
import { PermissionService } from '@core/services/permission.service';

type FormSection = 'scopes' | 'name_comment' | 'goals' | 'folders' | '';

@Component({
  selector: 'parteng-project-form',
  templateUrl: './project-form.component.html',
  styleUrls: ['./project-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectFormComponent extends AbstractFormComponent<Project> implements OnInit, OnChanges {
  @Input() isNew!: boolean;
  @Input() project!: Project;
  @Input() projectTemplates: ProjectTemplate2[] = [];
  @Input() projectTemplate: ProjectTemplate2 | undefined;
  @Input() allStandardFolders: StandardFolder2[] = [];
  @Input() formSectionsState!: ProjectFormSectionsState;

  @Output() validateSelectedTemplate = new EventEmitter<number>();
  @Output() projectIdentificationChanged = new EventEmitter<Partial<ProjectIdentification>>();
  @Output() projectIdentificationSubmitted = new EventEmitter<Project>();
  @Output() delete = new EventEmitter<Project>();
  @Output() cancel = new EventEmitter<void>();

  @ViewChild('projectIdentificationBlock', { static: true })
  projectIdentificationBlock!: ProjectFormBlockComponent;

  canEdit!: boolean;
  isProjectIdentificationInEditMode!: boolean;
  projectIdentificationCopy: ProjectIdentification | undefined;
  PROJECT_ORDINARY = PROJECT_ORDINARY;

  private activeFormSection: FormSection = '';

  get projectScopes(): Scope[] {
    return this.project ? this.project.relProjectToScopes.map((rel) => rel.scope) : [];
  }

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private scopeService: ScopeService,
    private folderService: FolderService,
    public permissionService: PermissionService
  ) {
    super();
  }

  override ngOnInit() {
    super.ngOnInit();
    this.isProjectIdentificationInEditMode = this.isNew;
    // setInterval(() => {
    //   this.canEdit = !this.canEdit;
    //   console.log(`this.canEdit=${this.canEdit}`);
    //   setTimeout(() => this.cdr.markForCheck());
    // }, 2000);
  }

  override ngOnChanges(changes: SimpleChanges): void {
    super.ngOnChanges(changes);
    // The current form may be updated from state changes
    if (changes['project'] && !changes['project'].firstChange) {
      this.updateForm();
    }
    this.canEdit = this.isNew || (!this.isNew && this.project.validationStatus === VALIDATION_STATUS.NOT_REVIEWED);
  }

  //

  get isFormInvalid(): boolean {
    return this.form.invalid || this.form.value.relProjectToScopes.length === 0;
  }

  get isDeletable(): boolean {
    const canDelete = true; // @TODO: fetch user permission from backend
    return !this.isNew && this.project.validationStatus !== VALIDATION_STATUS.VALIDATED && canDelete;
  }

  get isEditable(): boolean {
    const canUpdate = true; // @TODO: fetch user permission from backend
    return this.isNew || (!this.isNew && this.project.validationStatus !== VALIDATION_STATUS.VALIDATED && canUpdate);
  }

  buildForm(): void {
    this.form = this.fb.group({
      ordinary: [this.project.ordinary],
      name: [this.project.name, Validators.required],
      comment: [this.project.comment],
      relProjectToScopes: [this.project.relProjectToScopes],
      relProjectToGoals: [this.project.relProjectToGoals],
      folders: [this.project.folders],
    });
    this.updateForm(false);
  }

  private updateForm(markAsDirty = true): void {
    this.form.patchValue(this.project);

    // without this, form doesn't "see" updates from state
    if (markAsDirty) {
      this.form.markAsDirty();
    }

    if (this.formSectionsState.isProjectIdentificationDisabled) {
      this.form.get('name')?.disable();
      this.form.get('comment')?.disable();
    } else {
      this.form.get('name')?.enable();
      this.form.get('comment')?.enable();
    }
  }

  serializeForm(): Project {
    const formData = this.form!.value;

    // Only update values that have been actually collected via the form
    // Scopes, goals and folders are updated directly in `this.project`
    // by their respective selectors dialogs.
    const project = this.project.clone({
      ordinary: formData.ordinary,
      name: formData.name,
      comment: formData.comment,
    });

    return project;
  }

  //
  //
  //

  // NB. The choice could be "no template" (undefined)
  submitTemplateChoice(templateId?: number): void {
    this.validateSelectedTemplate.emit(templateId);
    this.setActiveFormSection('scopes');
  }

  //
  // ===== Project Scopes =====
  //

  async clickOpenScopeSelector(): Promise<void> {
    this.setActiveFormSection('scopes');
    const scopes: Scope[] | undefined = await lastValueFrom(
      this.scopeService.showScopeSelectorDialog({
        title: 'project.dialogScopeSelector.titleSelectScopesForProject',
        selectedScopes: this.project.relProjectToScopes.map((rel) => rel.scope),
      })
    );
    if (scopes) {
      this.store.dispatch(projectFormActions.submitSelectedScopesForProject({ scopes }));
      this.setActiveFormSection('name_comment');
    }
  }

  //
  // ===== Project Identification =====
  //

  activateProjectIdentificationInEditMode(): void {
    this.isProjectIdentificationInEditMode = true;
    // save the current values in case user cancels the edit
    this.projectIdentificationCopy = {
      name: this.project.name,
      comment: this.project.comment || '',
      ordinary: this.project.ordinary,
    };
    this.setActiveFormSection('name_comment');
  }

  cancelNameAndCommentEdition(): void {
    const formData = this.form!.value;
    if (
      this.projectIdentificationCopy &&
      (this.projectIdentificationCopy.name !== formData.name ||
        this.projectIdentificationCopy.comment !== formData.comment)
    ) {
      this.form.patchValue(this.projectIdentificationCopy);
      this.projectIdentificationChanged.emit(this.projectIdentificationCopy);
    }
    this.projectIdentificationCopy = undefined;
    this.isProjectIdentificationInEditMode = false;
    this.setActiveFormSection('');
  }

  // required to update the keep the project up-to-date in the state
  onProjectOrdinaryChanged(ev: MatRadioChange): void {
    this.projectIdentificationChanged.emit({ ordinary: ev.value });
  }

  // required to update the form state
  onProjectNameChanged(ev: Event): void {
    this.projectIdentificationChanged.emit({ name: (ev.target as HTMLInputElement).value });
  }

  // required to update the form state
  onProjectCommentChanged(ev: Event): void {
    this.projectIdentificationChanged.emit({ comment: (ev.target as HTMLInputElement).value });
  }

  onProjectIdentificationSubmitted(): void {
    const project = this.serializeForm();
    this.projectIdentificationSubmitted.emit(project);
    this.projectIdentificationCopy = undefined;
    this.isProjectIdentificationInEditMode = false;
    this.projectIdentificationBlock.isEditMode = false;
    this.setActiveFormSection('goals');
  }

  onProjectNameOrCommentFocused(): void {
    this.setActiveFormSection('name_comment');
  }

  isBtnValidateProjectIdentificationEnabled(): boolean {
    const projectName = this.form.get('name')?.value;
    const projectNameIsNotEmpty = projectName && projectName.trim() !== '';
    const atLeastOneIdentificationFieldModified =
      this.form.get('name')?.dirty || this.form.get('comment')?.dirty || this.form.get('ordinary')?.dirty;
    return projectNameIsNotEmpty && atLeastOneIdentificationFieldModified;
  }

  //
  // ===== Project Goals =====
  //

  clickOpenGoalSelector(): void {
    this.store.dispatch(projectFormActions.openDialogGoalSelectorFromProjectPage());
    this.setActiveFormSection('goals');
  }

  async openProjectGoalEnricher(relProjectToGoal: RelProjectToGoal): Promise<void> {
    this.setActiveFormSection('goals');
    const relProjectToGoalUpdated = await lastValueFrom(this.openProjectGoalEnricherDialog(relProjectToGoal));
    if (relProjectToGoalUpdated) {
      this.store.dispatch(projectFormActions.updateProjectGoal({ relProjectToGoal: relProjectToGoalUpdated }));
      this.setActiveFormSection('folders');
    }
  }

  private openProjectGoalEnricherDialog(relProjectToGoal: RelProjectToGoal): Observable<RelProjectToGoal | undefined> {
    return this.dialog
      .open<DialogGoalEnricherComponent, DialogGoalEnricherData>(DialogGoalEnricherComponent, {
        width: DIALOG_WIDTH_SMALL,
        data: { relProjectToGoal },
      })
      .afterClosed();
  }

  removeProjectGoal(goal: Goal): void {
    this.store.dispatch(projectFormActions.removeProjectGoal({ goal }));
  }

  //
  // ===== Project Folders =====
  //

  /**
   * @param folderInfo Undefined when creating a new folder.
   */
  async openFolderForm(folderInfo?: { folder: Folder; folderIndex: number }): Promise<void> {
    this.setActiveFormSection('folders');
    const folder =
      folderInfo?.folder ||
      this.folderService.newFolder({ scopes: this.project.relProjectToScopes.map((rel) => rel.scope) });
    const isNew = !folderInfo?.folder;
    const folderUpdated = await lastValueFrom(
      this.openFolderFormDialog({
        folder,
        isNew,
        allStandardFolders: this.allStandardFolders,
        existingProjectFolderNames: this.project.folders.map((f) => f.name),
      })
    );
    if (folderUpdated) {
      this.store.dispatch(
        projectFormActions.saveProjectFolder({ folder: folderUpdated, folderIndex: folderInfo?.folderIndex })
      );
    }
  }

  private openFolderFormDialog(data: DialogFolderFormData): Observable<Folder | undefined> {
    return this.dialog
      .open<DialogFolderFormComponent, DialogFolderFormData>(DialogFolderFormComponent, {
        width: DIALOG_WIDTH_MEDIUM,
        data,
      })
      .afterClosed();
  }

  removeFolder(folderIndex: number): void {
    this.store.dispatch(projectFormActions.removeProjectFolder({ folderIndex }));
  }

  onDraggedFolderWasDropped(event: CdkDragDrop<Folder[]>): void {
    // this.draggedItemWasDropped.emit(event);
    const foldersCopy = [...this.project.folders]; // work on a mutable copy of the original array
    moveItemInArray(foldersCopy, event.previousIndex, event.currentIndex);
    this.store.dispatch(projectFormActions.reorderProjectFolders({ folders: foldersCopy }));
  }

  //
  //
  //

  isFormSectionActive(section: FormSection): boolean {
    return section === this.activeFormSection;
  }

  clickCancel(): void {
    this.cancel.emit();
  }

  clickDelete(): void {
    const project = this.serializeForm();
    this.delete.emit(project);
  }

  private setActiveFormSection(section: FormSection): void {
    this.activeFormSection = section;
  }
}
