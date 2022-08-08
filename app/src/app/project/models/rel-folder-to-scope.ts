import { HALDeserializeFrom } from '@app/core/services/hal-serializer.service';
import { ENTITY_STATUS } from '@app/shared/models';
import { Scope } from './scope.model';

export class RelFolderToScope {
  @HALDeserializeFrom()
  folders_id: number = 0;

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

export function scopesToRelFolderToScopes(scopes: Scope[], folderId: number): RelFolderToScope[] {
  return scopes.map((scope) => {
    const relFolderToScope = new RelFolderToScope();
    relFolderToScope.folders_id = folderId;
    relFolderToScope.scopes_id = scope.id;
    relFolderToScope.scope = scope;
    relFolderToScope.status = ENTITY_STATUS.ACTIVE;
    return relFolderToScope;
  });
}
