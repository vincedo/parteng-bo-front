import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AbstractFormDialogComponent } from '@app/core/components';
import { TaskService } from '@app/core/services/task.service';
import { ServicesStore } from '@app/core/store/services.store';
import { FundType, LegalEntityType, Person, PERSON_TYPE, Project } from '@app/project/models';
import { FundTypeService } from '@app/project/services/fund-type.service';
import { LegalEntityTypeService } from '@app/project/services/legal-entity-type.service';
import { PersonService } from '@app/project/services/person.service';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom, Observable } from 'rxjs';
import { GenericDialogService } from '../generic-dialog/generic-dialog.service';
import { PersonFormSharedComponent } from '../person-form-shared/person-form-shared.component';

export interface DialogPersonCreationData {
  mode: 'create' | 'view' | 'edit';
  project: Project | undefined;
  person: Person;
  showDeleteButton: boolean;
  fundManager?: boolean;
  disablePersonCreation?: boolean;
}

@Component({
  selector: 'parteng-dialog-person-creation',
  template: `
    <parteng-dialog
      [showDialogButtons]="false"
      [title]="
        dialogParams.mode === 'create'
          ? ('project.dialogPersonForm.' + personType() + '.title' | translate)
          : (dialogParams.person.person_type | personTypeToTranslatedLabel)
      "
      [description]="
        dialogParams.mode === 'create' ? ('project.dialogPersonForm.' + personType() + '.description' | translate) : ''
      "
      [isSubmitDisabled]="isFormInvalid"
      (cancel)="cancel()"
      (safeClose)="cancel()"
    >
      <div *ngIf="mode === 'view'" class="text-right">
        <mat-icon
          class="ml-2 text-neutral-500 cursor-pointer"
          (click)="mode = 'edit'"
          parteng-requires-permission="update"
          parteng-requires-resource="persons"
          data-testId="person-update-button"
          >edit</mat-icon
        >
      </div>

      <parteng-person-form-shared
        [mode]="mode"
        [person]="dialogParams.person"
        [project]="dialogParams.project"
        [allLegalEntityTypes]="(allLegalEntityTypes$ | async)!"
        [allFundTypes]="(allFundTypes$ | async)!"
        [allPersons]="(allPersons$ | async)!"
        [showDeleteButton]="dialogParams.showDeleteButton"
        [disablePersonCreation]="!!dialogParams.disablePersonCreation"
        (deletePerson)="onDeletePerson()"
        (cancel)="cancel()"
        (formSubmitted)="onFormSubmitted($event)"
        [backendError]="backendError"
      ></parteng-person-form-shared>
    </parteng-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogPersonCreationComponent extends AbstractFormDialogComponent<Person> implements OnInit {
  // TODO: remove
  formState$!: Observable<any>;
  PERSON_TYPE = PERSON_TYPE;
  allLegalEntityTypes$ = this.servicesStore.select<LegalEntityType[]>('legalEntityTypes');
  allFundTypes$ = this.servicesStore.select<FundType[]>('fundTypes');
  allPersons$: Observable<Person[]> = this.servicesStore.select<Person[]>('allPersons');
  fundManager: Person | undefined;
  backendError: string = '';
  mode: 'create' | 'view' | 'edit' = 'create';

  @ViewChild(PersonFormSharedComponent) formComponent!: PersonFormSharedComponent;

  constructor(
    dialogRef: MatDialogRef<DialogPersonCreationComponent>,
    @Inject(MAT_DIALOG_DATA) public dialogParams: DialogPersonCreationData,
    private servicesStore: ServicesStore,
    private legalEntityTypeService: LegalEntityTypeService,
    private fundTypeService: FundTypeService,
    private personService: PersonService,
    private translateService: TranslateService,
    private taskService: TaskService,
    private genericDialogService: GenericDialogService
  ) {
    super(dialogRef);
    this.mode = this.dialogParams.mode;
  }

  ngOnInit() {
    this.servicesStore.dispatch(this.legalEntityTypeService.getAll$(), 'legalEntityTypes');
    this.servicesStore.dispatch(this.fundTypeService.getAll$(), 'fundTypes');
    this.servicesStore.dispatch(this.personService.getAll$(), 'allPersons');
  }

  personType() {
    return this.dialogParams.fundManager ? 'fundManager' : this.dialogParams.person.person_type;
  }

  async onDeletePerson() {
    const confirm = await lastValueFrom(
      this.genericDialogService.binary(
        this.translateService.instant('persons.deleteDialog.title', { name: this.dialogParams.person.name }),
        this.translateService.instant('persons.deleteDialog.description', { name: this.dialogParams.person.name }),
        this.translateService.instant('persons.deleteDialog.yes'),
        this.translateService.instant('persons.deleteDialog.no')
      )
    );
    if (!confirm) {
      return;
    }
    await this.taskService.doDelete$(this.personService.deletePerson$(this.dialogParams.person));
    this.dialogRef.close();
  }

  async onFormSubmitted(person?: Person | undefined) {
    if (!person) {
      return this.cancel();
    }
    try {
      const savedPerson = await this.taskService.doSave$(this.personService.save$(person));
      this.dialogRef.close(savedPerson);
    } catch (e: any) {
      this.backendError = `${e.error.detail}: ${Object.keys(e.error.errors).join(' - ')}`;
    }
  }

  cancel() {
    this.dialogRef.close();
  }
}
