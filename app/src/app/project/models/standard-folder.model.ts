import { HALDeserializeFrom } from '@app/core/services/hal-serializer.service';
import { EntityWithId } from '@app/shared/models';

export class StandardFolder2 extends EntityWithId {
  @HALDeserializeFrom()
  override status: number = 0;

  @HALDeserializeFrom()
  override id: number = 0;

  @HALDeserializeFrom()
  name: string = '';

  @HALDeserializeFrom()
  order: number = 0;

  @HALDeserializeFrom()
  comment: string = '';
}
