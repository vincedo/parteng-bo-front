import { HALDeserializeFrom } from '@app/core/services/hal-serializer.service';
import { ENTITY_STATUS } from '@app/shared/models';
import { Goal } from './goal.model';
import { Person } from './person.model';

export class RelProjectToGoal {
  @HALDeserializeFrom()
  projects_id: number = 0;

  @HALDeserializeFrom()
  goals_id: number = 0;

  @HALDeserializeFrom()
  goal!: Goal;

  @HALDeserializeFrom()
  status: number = 0;

  @HALDeserializeFrom()
  comment: string = '';

  // Cannot be embedded in the JSON
  // Must be populated via a separate API call
  persons: Person[] = [];
}

//
// ===== Helper Function(s) =====
//

export function goalsToRelProjectToGoals(goals: Goal[], projectId: number): RelProjectToGoal[] {
  return goals.map((goal) => {
    const relProjectToGoal = new RelProjectToGoal();
    relProjectToGoal.projects_id = projectId;
    relProjectToGoal.goals_id = goal.id;
    relProjectToGoal.goal = goal;
    relProjectToGoal.status = ENTITY_STATUS.ACTIVE;
    return relProjectToGoal;
  });
}
