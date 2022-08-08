import { HALDeserializeFrom } from '@app/core/services/hal-serializer.service';

export class RepaymentType {
  @HALDeserializeFrom()
  id: number = 0;

  @HALDeserializeFrom()
  name: string = '';

  @HALDeserializeFrom()
  order: number = 0;
}
