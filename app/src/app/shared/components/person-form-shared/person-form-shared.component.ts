import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { Validators } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { AbstractFormComponent } from '@app/core/components';
import {
  FundType,
  LegalEntityType,
  LEGAL_ENTITY_REGISTRATION_STATUS,
  Person,
  PERSON_TYPE,
  Project,
} from '@app/project/models';
import { PersonService } from '@app/project/services/person.service';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'parteng-person-form-shared',
  templateUrl: './person-form-shared.component.html',
})
export class PersonFormSharedComponent extends AbstractFormComponent<Person> implements OnChanges {
  @Input() mode: 'create' | 'view' | 'edit' = 'create';
  @Input() showDeleteButton: boolean = false;
  @Input() person!: Person;
  @Input() allLegalEntityTypes!: LegalEntityType[];
  @Input() allFundTypes!: FundType[];
  @Input() allPersons: Person[] = [];
  @Input() project: Project | undefined;
  @Input() disablePersonCreation: boolean = false;

  @Output() fundManagerChanged = new EventEmitter<void>();
  @Output() addFundManager = new EventEmitter<void>();
  @Output() deletePerson = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  fundManager: Person | undefined; // details for `person.fund_manager_id` -- only if person.type == INVESTMENT_FUND
  PERSON_TYPE = PERSON_TYPE;
  selectedFundManager: Person | undefined;

  constructor(private personService: PersonService, private cdr: ChangeDetectorRef) {
    super();
  }

  buildForm(): void {
    switch (this.person.person_type) {
      case PERSON_TYPE.NATURAL_PERSON:
        this.buildFormNaturalPerson();
        break;
      case PERSON_TYPE.LEGAL_PERSON:
        this.buildFormLegalPerson();
        break;
      case PERSON_TYPE.INVESTMENT_FUND:
        this.buildFormInvestmentFund();
        break;
    }
  }

  serializeForm(): Person {
    switch (this.person.person_type) {
      case PERSON_TYPE.NATURAL_PERSON:
        return this.serializeFormNaturalPerson();
      case PERSON_TYPE.LEGAL_PERSON:
        return this.serializeFormLegalPerson();
      case PERSON_TYPE.INVESTMENT_FUND:
        return this.serializeFormInvestmentFund();
    }
  }

  onDeleteButtonClick() {
    this.deletePerson.emit();
  }

  //
  // ----- Natural Person -----
  //

  private buildFormNaturalPerson(): void {
    const [lastName, firstName] = this.person.name ? this.person.name.split(' ') : ['', ''];
    this.form = this.fb.group({
      last_name: [lastName, Validators.required],
      first_name: [firstName, Validators.required],
      short_name: [this.person.short_name],
      comment: [this.person.comment],
    });
  }

  private serializeFormNaturalPerson(): Person {
    const formData = this.form.value;
    const person = this.person.clone();
    person.last_name = formData.last_name;
    person.first_name = formData.first_name;
    person.short_name = formData.short_name;
    person.comment = formData.comment;

    return person;
  }

  //
  // ----- Legal Person -----
  //

  private buildFormLegalPerson(): void {
    const isRegistrationPending =
      this.person.legal_entity_pending_registration === LEGAL_ENTITY_REGISTRATION_STATUS.PENDING; // enum to boolean
    this.form = this.fb.group({
      company_name: [this.person.company_name, Validators.required],
      short_name: [this.person.short_name],
      legal_entity_pending_registration: [isRegistrationPending],
      legal_entity_country_code: [this.person.legal_entity_country_code, Validators.required],
      legal_entity_identifier: [this.person.legal_entity_identifier, Validators.required],
      legal_entity_types_id: [this.person.legal_entity_types_id, Validators.required],
      comment: [this.person.comment],
    });
    this.updateLegalIdentifierControl(isRegistrationPending);
  }

  private serializeFormLegalPerson(): Person {
    const formData = this.form.value;
    const person = this.person.clone();
    person.company_name = formData.company_name;
    person.short_name = formData.short_name;
    person.legal_entity_pending_registration = formData.legal_entity_pending_registration
      ? LEGAL_ENTITY_REGISTRATION_STATUS.PENDING
      : LEGAL_ENTITY_REGISTRATION_STATUS.NOT_PENDING; // boolean to enum
    person.legal_entity_country_code = formData.legal_entity_country_code;
    person.legal_entity_identifier = formData.legal_entity_identifier;
    person.legal_entity_types_id = Number(formData.legal_entity_types_id);
    person.comment = formData.comment;

    return person;
  }

  onRegistrationPendingChanged(ev: MatCheckboxChange): void {
    this.updateLegalIdentifierControl(ev.checked);
  }

  private updateLegalIdentifierControl(isRegistrationPending: boolean): void {
    if (isRegistrationPending) {
      // disabling the control also disables its validators
      this.form.get('legal_entity_identifier')?.disable();
    } else {
      this.form.get('legal_entity_identifier')?.enable();
    }
  }

  getEntityTypeName(entityTypeId: number): string | undefined {
    return (this.allLegalEntityTypes || []).find((entityType) => entityType.id === entityTypeId)?.name;
  }

  //
  // ----- Investment Fund -----
  //

  private buildFormInvestmentFund(): void {
    this.form = this.fb.group({
      company_name: [this.person.company_name, Validators.required],
      short_name: [this.person.short_name],
      fund_types_id: [this.person.fund_types_id, Validators.required],
      fund_manager_id: [this.person.fund_manager_id, Validators.required],
      comment: [this.person.comment],
    });
  }

  async selectFundManager() {
    const selectedPersons = await lastValueFrom(
      this.personService.showFundManagerSelectorDialog(this.project, this.disablePersonCreation)
    );
    this.fundManager = selectedPersons ? selectedPersons[0] : undefined;
    if (this.fundManager) {
      this.form.patchValue({ fund_manager_id: this.fundManager.id });
      this.cdr.detectChanges();
    }
  }

  getFundTypeName(fundTypeId: number): string | undefined {
    return (this.allFundTypes || []).find((fundType) => fundType.id === fundTypeId)?.name;
  }

  getFundManager(fundManagerId: number | undefined) {
    return (this.allPersons || []).find((person) => person.id === fundManagerId);
  }

  private serializeFormInvestmentFund(): Person {
    const formData = this.form.value;
    const person = this.person.clone();
    person.company_name = formData.company_name;
    person.short_name = formData.short_name;
    person.fund_types_id = Number(formData.fund_types_id);
    person.fund_manager_id = formData.fund_manager_id;
    person.comment = formData.comment;

    return person;
  }
}
