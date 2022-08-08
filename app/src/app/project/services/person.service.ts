import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { RestService } from '@app/core/services';
import { ServicesStore } from '@app/core/store/services.store';
import { SettingsService } from '@app/data-entry/services/settings.service';
import {
  DialogFundManagerSelectorSharedComponent,
  DialogFundManagerSelectorSharedData,
} from '@app/shared/components/dialog-fund-manager-selector/dialog-fund-manager-selector-shared.component';
import {
  DialogPersonCreationComponent,
  DialogPersonCreationData,
} from '@app/shared/components/dialog-person-creation/dialog-person-creation.component';
import {
  DialogPersonsSelectorComponent,
  DialogPersonsSelectorData,
} from '@app/shared/components/dialog-persons-selector/dialog-persons-selector.component';
import { HALResource } from '@app/shared/models';
import { PartengApiService, SerializerService } from '@app/shared/services';
import { DIALOG_WIDTH_LARGE, DIALOG_WIDTH_MEDIUM, DIALOG_WIDTH_SMALL } from '@app/shared/shared.constants';
import { TranslateService } from '@ngx-translate/core';
import * as _ from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Project } from '../models';
import { Person, PersonDto, personSetFundManagerName, PERSON_TYPE } from '../models/person.model';

@Injectable({ providedIn: 'root' })
export class PersonSerializerService extends SerializerService<Person, PersonDto> {
  fromDto(json: HALResource<PersonDto>): Person {
    return new Person(json);
  }

  toDto(entity: Person): any {
    return {
      ...this.getDtoBaseProps(entity),

      // note that entity.name is a computed prop and is not included in the DTO
      first_name: entity.first_name,
      last_name: entity.last_name,
      company_name: entity.company_name,
      short_name: entity.short_name,
      person_type: entity.person_type,
      creation_projects_id: entity.creation_projects_id,

      legal_entity_types_id: entity.legal_entity_types_id!,
      legal_entity_identifier: entity.legal_entity_identifier!,
      legal_entity_country_code: entity.legal_entity_country_code!,
      legal_entity_pending_registration: entity.legal_entity_pending_registration,

      fund_types_id: entity.fund_types_id!,
      fund_manager_id: entity.fund_manager_id!,

      validation_status: entity.validation_status,
      comment: entity.comment!,
    };
  }
}

@Injectable({ providedIn: 'root' })
export class PersonService extends PartengApiService<Person, HALResource<PersonDto>> {
  constructor(
    rest: RestService,
    serializer: PersonSerializerService,
    private dialog: MatDialog,
    private translateService: TranslateService,
    private settingsService: SettingsService,
    private servicesStore: ServicesStore
  ) {
    super(rest, serializer, '/persons', 'persons');
  }

  getPersonType(personType: PERSON_TYPE): number {
    return {
      [PERSON_TYPE.INVESTMENT_FUND]: this.settingsService.get<number>('PERSON_TYPE_INVESTMENT_FUND')!,
      [PERSON_TYPE.LEGAL_PERSON]: this.settingsService.get<number>('PERSON_TYPE_LEGAL_PERSON')!,
      [PERSON_TYPE.NATURAL_PERSON]: this.settingsService.get<number>('PERSON_TYPE_NATURAL_PERSON')!,
    }[personType];
  }

  newPerson(project: Project | undefined, personType?: PERSON_TYPE): Person {
    return new Person({
      creation_projects_id: project ? project.id : undefined,
      person_type: personType,
      legal_entity_country_code: 'FR',
    });
  }

  isLegalPerson(person: Person): boolean {
    return person.person_type === this.settingsService.get<PERSON_TYPE>('PERSON_TYPE_LEGAL_PERSON');
  }

  showPersonSelectorDialog(opts: {
    project: Project;
    title: string;
    description: string;
    selectedPersons?: Person[];
    titleName?: string;
    disableAddPersonButton?: boolean;
    isMonoSelection?: boolean;
    forceLargeWidth?: boolean;
  }): Observable<Person[] | undefined> {
    this.servicesStore.dispatch(this.getAll$(), 'persons');
    return this.dialog
      .open<DialogPersonsSelectorComponent, DialogPersonsSelectorData>(DialogPersonsSelectorComponent, {
        width: opts.forceLargeWidth ? DIALOG_WIDTH_LARGE : DIALOG_WIDTH_MEDIUM,
        data: {
          project: opts.project,
          dialogTitle: this.translateService.instant(opts.title, { name: opts.titleName }),
          dialogDescription: this.translateService.instant(opts.description),
          additionalInfoTitle: this.translateService.instant('shared.dialogPersonSelector.itemAdditionalInfoTitle'),
          selectedPersons: opts.selectedPersons || [],
          disableAddPersonButton: opts.disableAddPersonButton ?? false,
          isMonoSelection: opts.isMonoSelection ?? true,
        },
      })
      .afterClosed();
  }

  showPersonDialog({
    project,
    personType,
    mode,
    person,
    showDeleteButton = false,
    fundManager = false,
    disablePersonCreation = false,
  }: {
    project?: Project;
    personType: PERSON_TYPE;
    mode: 'create' | 'view' | 'edit';
    person?: Person;
    showDeleteButton?: boolean;
    fundManager?: boolean;
    disablePersonCreation?: boolean;
  }): Observable<Person | undefined> {
    return this.dialog
      .open<DialogPersonCreationComponent, DialogPersonCreationData>(DialogPersonCreationComponent, {
        width: DIALOG_WIDTH_SMALL,
        data: {
          mode,
          project,
          showDeleteButton,
          person: person || this.newPerson(project, personType),
          fundManager,
          disablePersonCreation,
        },
      })
      .afterClosed();
  }

  showFundManagerSelectorDialog(project?: Project, disablePersonCreation = false): Observable<Person[] | undefined> {
    return this.dialog
      .open<DialogFundManagerSelectorSharedComponent, DialogFundManagerSelectorSharedData>(
        DialogFundManagerSelectorSharedComponent,
        {
          width: DIALOG_WIDTH_SMALL,
          data: {
            project,
            disablePersonCreation,
          },
        }
      )
      .afterClosed();
  }

  showFundManagerCreationDialog(project?: Project): Observable<Person | undefined> {
    return this.showPersonDialog({
      project,
      personType: this.settingsService.get<PERSON_TYPE>('PERSON_TYPE_LEGAL_PERSON')!,
      mode: 'create',
      showDeleteButton: false,
      fundManager: true,
    });
  }

  getAll$(): Observable<Person[]> {
    return this.personsMapper$(this.getCollection$());
  }

  getCreatedPersons$(projectId: number): Observable<Person[]> {
    return this.personsMapper$(
      this.getCollection$({
        queryParams: {
          creation_projects_id: projectId.toString(),
        },
      })
    );
  }

  getReferencedPersons$(projectId: number): Observable<Person[]> {
    return this.personsMapper$(
      this.getCollection$({
        queryParams: {
          projects_id: projectId.toString(),
        },
      })
    );
  }

  private personsMapper$(persons$: Observable<Person[]>): Observable<Person[]> {
    return persons$.pipe(
      map((persons) => _.sortBy(persons, 'name')),
      map((persons) =>
        // add the full name of the fund manager for "investment fund" persons
        persons.map((p) => (p.person_type === PERSON_TYPE.INVESTMENT_FUND ? personSetFundManagerName(p, persons) : p))
      )
    );
  }

  save$(person: Person): Observable<Person> {
    return person.id ? this.putOne$(person, person.id) : this.postOne$(person);
  }

  deletePerson$(person: Person): Observable<void> {
    return this.deleteOne$({ endpoint: '/persons/' + person.id });
  }
}
