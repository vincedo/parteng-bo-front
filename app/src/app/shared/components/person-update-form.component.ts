import { Component, Input } from '@angular/core';
import { AbstractFormComponent } from '@app/core/components';
import { FundType, LegalEntityType, Person, PERSON_TYPE } from '@app/project/models';

@Component({
  selector: 'app-person-update-form',
  template: ``,
})
export class PersonUpdateFormComponent extends AbstractFormComponent<Person> {
  @Input() person!: Person;
  @Input() allLegalEntityTypes!: LegalEntityType[];
  @Input() allFundTypes!: FundType[];
  @Input() fundManager: Person | undefined; // details for `person.fund_manager_id` -- only if person.type == INVESTMENT_FUND

  constructor() {
    super();
  }

  buildForm(): void {
    // switch (this.person.person_type) {
    //   case PERSON_TYPE.NATURAL_PERSON:
    //     this.buildFormNaturalPerson();
    //     break;
    //   case PERSON_TYPE.LEGAL_PERSON:
    //     this.buildFormLegalPerson();
    //     break;
    //   case PERSON_TYPE.INVESTMENT_FUND:
    //     this.buildFormInvestmentFund();
    //     break;
    // }
  }

  serializeForm(): Person {
    // switch (this.person.person_type) {
    //   case PERSON_TYPE.NATURAL_PERSON:
    //     return this.serializeFormNaturalPerson();
    //   case PERSON_TYPE.LEGAL_PERSON:
    //     return this.serializeFormLegalPerson();
    //   case PERSON_TYPE.INVESTMENT_FUND:
    //     return this.serializeFormInvestmentFund();
    // }
  }
}
