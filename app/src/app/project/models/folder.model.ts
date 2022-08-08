import { EntityWithId, ENTITY_STATUS_DEFAULT } from '@app/shared/models';
import { StandardFolder2 } from './standard-folder.model';
import { Scope } from './scope.model';
import { HALDeserializeFrom, HALSerializeTo } from '@app/core/services/hal-serializer.service';
import { RelFolderToScope, scopesToRelFolderToScopes } from './rel-folder-to-scope';

export class Folder extends EntityWithId {
  @HALDeserializeFrom()
  @HALSerializeTo()
  override status: number = 0;

  @HALDeserializeFrom()
  override id: number = 0;

  @HALDeserializeFrom()
  @HALSerializeTo()
  name: string = '';

  @HALDeserializeFrom('long_name')
  longName: string = '';

  @HALDeserializeFrom()
  @HALSerializeTo()
  order: number = 0;

  @HALDeserializeFrom('projects_id')
  @HALSerializeTo('projects_id')
  projectId: number = 0;

  @HALDeserializeFrom('validation_status')
  @HALSerializeTo('validation_status')
  validationStatus: number = 0;

  @HALDeserializeFrom('date_max')
  dateMax: string = '';

  @HALDeserializeFrom('date_min')
  dateMin: string = '';

  @HALDeserializeFrom()
  @HALSerializeTo()
  comment: string = '';

  // @TODO: check that it works
  // As of 7-APR-2022, the backend doesn't return that piece of data
  @HALDeserializeFrom('rel_folders_to_scopes', RelFolderToScope)
  relFolderToScopes: RelFolderToScope[] = [];

  // Use this to modify a folder from the store (cause store data is immutable)
  clone(
    opts: Partial<{
      id: number;
      status: number;
      name: string;
      order: number;
      projectId: number;
      validationStatus: number;
      comment: string;
      scopes: Scope[];
    }> = {}
  ): Folder {
    const clone = new Folder();

    clone.id = opts.id !== undefined ? opts.id : this.id;
    clone.status = opts.status !== undefined ? opts.status : this.status;

    clone.name = opts.name !== undefined ? opts.name : this.name;
    clone.order = opts.order !== undefined ? opts.order : this.order;
    clone.projectId = opts.projectId !== undefined ? opts.projectId : this.projectId;
    clone.validationStatus = opts.validationStatus !== undefined ? opts.validationStatus : this.validationStatus;
    clone.comment = opts.comment !== undefined ? opts.comment : this.comment;
    clone.relFolderToScopes = opts.scopes
      ? scopesToRelFolderToScopes(opts.scopes, this.id)
      : [...this.relFolderToScopes];

    // Some props can't be updated.
    clone.created = this.created;
    clone.updated = this.updated;
    clone.dateMin = this.dateMin;
    clone.dateMax = this.dateMax;

    return clone;
  }
}

//
// ----- Helper Functions
//

export function standardFolder2sToFolder2s(standardFolders: StandardFolder2[]): Folder[] {
  return standardFolders.map((standardFolder, index) => standardFolder2ToFolder2(standardFolder, { order: index + 1 }));
}

function standardFolder2ToFolder2(standardFolder: StandardFolder2, opts: { order: number }): Folder {
  const folder = new Folder();
  folder.name = standardFolder.name;
  folder.order = opts.order;
  folder.status = ENTITY_STATUS_DEFAULT;
  return folder;
}
