import { HALDeserializeFrom } from '@app/core/services/hal-serializer.service';
import { ENTITY_STATUS } from '@app/shared/models';
import { Scope } from './scope.model';

export class RelProjectToScope {
  @HALDeserializeFrom()
  projects_id: number = 0;

  @HALDeserializeFrom()
  scopes_id: number = 0;

  @HALDeserializeFrom()
  scope!: Scope;

  @HALDeserializeFrom()
  status: number = 0;

  @HALDeserializeFrom()
  comment: string = '';
}

//
// ----- Helper Function(s)
//

export function scopesToRelProjectToScopes(scopes: Scope[], projectId: number): RelProjectToScope[] {
  return scopes.map((scope) => {
    const relProjectToScope = new RelProjectToScope();
    relProjectToScope.projects_id = projectId;
    relProjectToScope.scopes_id = scope.id;
    relProjectToScope.scope = scope;
    relProjectToScope.status = ENTITY_STATUS.ACTIVE;
    return relProjectToScope;
  });
}
