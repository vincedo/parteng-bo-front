import { HALDeserializeFrom } from '@app/core/services/hal-serializer.service';
import { Goal } from './goal.model';

export class RelProjectTemplateToGoal {
  @HALDeserializeFrom()
  project_templates_id: number = 0;

  @HALDeserializeFrom()
  goals_id: number = 0;

  @HALDeserializeFrom()
  goal!: Goal;

  @HALDeserializeFrom()
  status: number = 0;
}
