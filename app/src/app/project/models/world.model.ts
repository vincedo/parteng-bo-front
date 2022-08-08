import { HALDeserializeFrom } from '@app/core/services/hal-serializer.service';
import { EntityWithId } from '@app/shared/models';

export class World extends EntityWithId {
  @HALDeserializeFrom()
  override status: number = 0;

  @HALDeserializeFrom()
  override id: number = 0;

  @HALDeserializeFrom()
  order: number = 0;

  @HALDeserializeFrom()
  name: string = '';
}
