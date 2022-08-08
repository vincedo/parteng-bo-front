import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { Entity } from '../models';

@Component({
  selector: 'parteng-entity-created-updated-info',
  template: `<div class="text-sm text-blue-ptg-primary-800 my-4">
    {{
      'shared.entityDates.createdOn' | translate: { date: entity.created | secondsToMilliseconds | date: 'shortDate' }
    }}
    -
    {{
      'shared.entityDates.updatedOn' | translate: { date: entity.updated | secondsToMilliseconds | date: 'shortDate' }
    }}
  </div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EntityCreatedUpdatedInfoComponent {
  @Input() entity!: Entity;
}
