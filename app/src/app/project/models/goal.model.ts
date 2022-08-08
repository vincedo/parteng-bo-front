import { HALDeserializeFrom, HALSerializeTo } from '@app/core/services/hal-serializer.service';
import { EntityWithId } from '@app/shared/models';

export class Goal extends EntityWithId {
  @HALDeserializeFrom()
  @HALSerializeTo()
  override status: number = 0;

  @HALDeserializeFrom()
  override id: number = 0;

  @HALDeserializeFrom()
  @HALSerializeTo()
  name: string = '';

  @HALDeserializeFrom()
  @HALSerializeTo()
  order: number = 0;

  @HALDeserializeFrom()
  @HALSerializeTo()
  comment: string = '';
}
