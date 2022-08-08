import { Injectable } from '@angular/core';

import { EntityWithIdDto, HALResource } from '@app/shared/models';
import { SerializerService } from '@app/shared/services';
import { Goal } from '../models';

export interface GoalDto extends EntityWithIdDto {
  name: string;
  order: number;
  comment: string;
}

@Injectable({ providedIn: 'root' })
export class GoalSerializerService extends SerializerService<Goal, GoalDto> {
  fromDto(json: GoalDto | HALResource<GoalDto>): Goal {
    const goal = new Goal();
    goal.name = json.name!;
    goal.order = json.order!;
    goal.comment = json.comment;
    goal.id = json.id;
    goal.status = json.status;
    goal.created = json.created;
    goal.updated = json.updated;
    return goal;
  }

  toDto(): any {}
}
