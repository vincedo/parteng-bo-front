import { HALDeserializeFrom } from '@app/core/services/hal-serializer.service';
import { EntityWithId, EntityWithIdDto } from '@app/shared/models';

export class InstrumentType extends EntityWithId {
  @HALDeserializeFrom()
  override id: number = 0;

  @HALDeserializeFrom()
  name: string = '';

  @HALDeserializeFrom()
  short_name: string = '';

  @HALDeserializeFrom()
  naming_rule: string = '';

  @HALDeserializeFrom()
  order: number = 0;

  @HALDeserializeFrom()
  included_in_cap_table: number = 0;

  @HALDeserializeFrom()
  has_warrant: number = 0;

  @HALDeserializeFrom()
  comment: string | undefined;
}

export interface InstrumentTypeDto extends EntityWithIdDto {
  name: string;
  short_name: string;
  naming_rule: string;
  order: number;
  included_in_cap_table: number;
  has_warrant: number;
  comment: string;
}
