import { HALDeserializeFrom } from '@app/core/services/hal-serializer.service';
import { World } from './world.model';

export class RelScopeToWorld {
  @HALDeserializeFrom()
  scopes_id: number = 0;

  @HALDeserializeFrom()
  worlds_id: number = 0;

  @HALDeserializeFrom()
  world!: World;

  @HALDeserializeFrom()
  status: number = 0;

  @HALDeserializeFrom()
  comment: string = '';
}
