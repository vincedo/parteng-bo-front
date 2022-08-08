import { EntityWithId, EntityWithIdDto, VALIDATION_STATUS, VALIDATION_STATUS_DEFAULT } from '@app/shared/models';
import { Project } from './project.model';

export enum PERSON_TYPE {
  INVESTMENT_FUND = 1,
  LEGAL_PERSON = 2,
  NATURAL_PERSON = 3,
}

export enum LEGAL_ENTITY_REGISTRATION_STATUS {
  NOT_PENDING = 1,
  PENDING = 2,
}

export interface PersonDto extends EntityWithIdDto {
  first_name: string;
  last_name: string;
  company_name: string;
  name: string;
  short_name: string;
  person_type: PERSON_TYPE;
  creation_projects_id: number;

  // legal
  legal_entity_types_id: number;
  legal_entity_identifier: string;
  legal_entity_country_code: string;
  legal_entity_pending_registration: LEGAL_ENTITY_REGISTRATION_STATUS;

  // fund
  fund_types_id: number;
  fund_manager_id: number;
  $fundManagerName: string;

  validation_status: VALIDATION_STATUS;
  comment: string;
}

export class Person extends EntityWithId {
  first_name: string;
  last_name: string;
  company_name: string;
  name: string; // required - computed value -- do not expose in forms
  short_name: string;
  person_type: PERSON_TYPE; // required
  creation_projects_id: number; // FK - required
  creationProject: Project | undefined;

  // legal
  legal_entity_types_id: number | undefined; // FK
  legal_entity_identifier: string | undefined;
  legal_entity_country_code: string | undefined;
  legal_entity_pending_registration: number | undefined;

  // fund
  fund_types_id: number | undefined; // FK
  fund_manager_id: number | undefined; // FK
  $fundManagerName: string | undefined; // frontend-specific prop

  validation_status: VALIDATION_STATUS;
  comment: string | undefined;

  constructor(opts: Partial<PersonDto> = {}) {
    super(opts);

    this.first_name = opts.first_name!;
    this.last_name = opts.last_name!;
    this.company_name = opts.company_name!;
    this.name = opts.name!;
    this.short_name = opts.short_name!;
    this.person_type = opts.person_type!;
    this.creation_projects_id = opts.creation_projects_id!;
    this.legal_entity_types_id = opts.legal_entity_types_id;
    this.fund_types_id = opts.fund_types_id;
    this.fund_manager_id = opts.fund_manager_id;
    this.$fundManagerName = opts.$fundManagerName;
    this.legal_entity_identifier = opts.legal_entity_identifier;
    this.legal_entity_country_code = opts.legal_entity_country_code;
    this.legal_entity_pending_registration = opts.legal_entity_pending_registration;
    this.validation_status = opts.validation_status ?? VALIDATION_STATUS_DEFAULT;
    this.comment = opts.comment;
  }

  clone(opts: Partial<PersonDto> = {}): Person {
    const clone = new Person({
      ...this.cloneEntityProps(opts),
      first_name: opts.first_name || this.first_name,
      last_name: opts.last_name || this.last_name,
      company_name: opts.company_name || this.company_name,
      name: opts.name || this.name,
      short_name: opts.short_name || this.short_name,
      person_type: opts.person_type || this.person_type,
      creation_projects_id: opts.creation_projects_id || this.creation_projects_id,
      legal_entity_types_id: opts.legal_entity_types_id || this.legal_entity_types_id,
      fund_types_id: opts.fund_types_id || this.fund_types_id,
      fund_manager_id: opts.fund_manager_id || this.fund_manager_id,
      $fundManagerName: opts.$fundManagerName || this.$fundManagerName,
      legal_entity_identifier: opts.legal_entity_identifier || this.legal_entity_identifier,
      legal_entity_country_code: opts.legal_entity_country_code || this.legal_entity_country_code,
      legal_entity_pending_registration:
        opts.legal_entity_pending_registration || this.legal_entity_pending_registration,
      comment: opts.comment || this.comment,
      validation_status: opts.validation_status || this.validation_status,
    });
    return clone;
  }
}

//
// Helper Function(s)
//

// Create a new Person instance of the given personType
export function personCreateNew(opts: { type: PERSON_TYPE; projectId: number }): Person {
  const person = new Person({ person_type: opts.type, creation_projects_id: opts.projectId });
  if (opts.type === PERSON_TYPE.LEGAL_PERSON) {
    person.legal_entity_country_code = 'FR';
  }
  return person;
}

export function personSetFundManagerName(investmentFund: Person, allPersons: Person[]): Person {
  return investmentFund.clone({
    $fundManagerName: allPersons.find((p) => p.id === investmentFund.fund_manager_id)?.name,
  });
}
