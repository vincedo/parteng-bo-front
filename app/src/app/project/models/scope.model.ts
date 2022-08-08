import { HALDeserializeFrom, HALSerializeTo } from '@app/core/services/hal-serializer.service';
import { EntityWithId } from '@app/shared/models';
import { RelScopeToWorld } from './rel-scope-to-world';
import { World } from './world.model';

export class Scope extends EntityWithId {
  @HALDeserializeFrom()
  @HALSerializeTo()
  override status: number = 0;

  @HALDeserializeFrom()
  override id: number = 0;

  @HALDeserializeFrom()
  @HALSerializeTo()
  code: string = '';

  @HALDeserializeFrom()
  @HALSerializeTo()
  name: string = '';

  @HALDeserializeFrom('historical_name')
  @HALSerializeTo('historical_name')
  historicalName: string = '';

  @HALDeserializeFrom()
  @HALSerializeTo()
  city: string = '';

  @HALDeserializeFrom()
  @HALSerializeTo()
  comment: string = '';

  @HALDeserializeFrom('rel_scopes_to_worlds', RelScopeToWorld)
  relScopeToWorlds: RelScopeToWorld[] = [];

  worlds: World[] = [];

  // Use this to modify a scope from the store (cause store data is immutable)
  clone(
    opts: Partial<{
      id: number;
      status: number;
      code: string;
      name: string;
      historicalName: string;
      city: string;
      comment: string;
    }> = {}
  ): Scope {
    const clone = new Scope();

    clone.id = opts.id !== undefined ? opts.id : this.id;
    clone.status = opts.status !== undefined ? opts.status : this.status;

    clone.code = opts.code !== undefined ? opts.code : this.code;
    clone.name = opts.name !== undefined ? opts.name : this.name;
    clone.historicalName = opts.historicalName !== undefined ? opts.historicalName : this.historicalName;
    clone.city = opts.city !== undefined ? opts.city : this.city;
    clone.comment = opts.comment !== undefined ? opts.comment : this.comment;

    // Some props can't be updated.
    clone.created = this.created;
    clone.updated = this.updated;
    clone.relScopeToWorlds = this.relScopeToWorlds;
    clone.worlds = this.worlds;

    return clone;
  }
}
