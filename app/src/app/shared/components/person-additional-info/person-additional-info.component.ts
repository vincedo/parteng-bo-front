import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { LEGAL_ENTITY_REGISTRATION_STATUS, Person, PERSON_TYPE } from '@app/project/models';

@Component({
  selector: 'parteng-person-additional-info',
  template: `
    <div [ngSwitch]="person.person_type" class="text-sm text-neutral-700">
      <div *ngSwitchCase="PERSON_TYPE.NATURAL_PERSON" class="text-sm"></div>

      <p *ngSwitchCase="PERSON_TYPE.LEGAL_PERSON">
        {{ person.legal_entity_country_code }}
        - {{ person.legal_entity_types_id! | legalEntityType }} -
        {{
          (person.legal_entity_pending_registration === LEGAL_ENTITY_REGISTRATION_STATUS.NOT_PENDING
            ? 'shared.dialogPersonSelector.legalEntityIdentifier'
            : 'shared.dialogPersonSelector.registrationPending'
          ) | translate: { legal_entity_identifier: person.legal_entity_identifier }
        }}
        <ng-container *ngIf="person.comment">
          <br />{{ 'shared.dialogPersonSelector.comment' | translate: { comment: person.comment } }}
        </ng-container>
      </p>

      <p *ngSwitchCase="PERSON_TYPE.INVESTMENT_FUND">
        {{ person.fund_types_id! | fundType }}
        -
        {{ 'shared.dialogPersonSelector.fundManager' | translate: { name: person.$fundManagerName } }}
        <ng-container *ngIf="person.comment">
          <br />{{ 'shared.dialogPersonSelector.comment' | translate: { comment: person.comment } }}
        </ng-container>
      </p>
      <div class="font-semibold">
        {{ 'shared.dialogPersonSelector.commentLabel' | translate }}
      </div>
      <div class="text-neutral-700">
        {{ person?.comment | dashOnEmpty }}
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonAdditionalInfoComponent {
  @Input() person!: Person;

  PERSON_TYPE = PERSON_TYPE;
  LEGAL_ENTITY_REGISTRATION_STATUS = LEGAL_ENTITY_REGISTRATION_STATUS;
}
