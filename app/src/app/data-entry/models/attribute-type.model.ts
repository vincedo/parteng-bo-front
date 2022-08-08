import { HALDeserializeFrom } from '@app/core/services/hal-serializer.service';
import { ValueType } from './value-type.model';
export class AttributeType {
  @HALDeserializeFrom()
  id: number = 0;

  @HALDeserializeFrom()
  name: string = '';

  @HALDeserializeFrom('naming_format')
  namingFormat: string = '';

  @HALDeserializeFrom()
  order: number = 0;

  @HALDeserializeFrom()
  pointer: string = '';

  @HALDeserializeFrom()
  unit: number = 0;

  @HALDeserializeFrom('value_types_id')
  valueTypeId: number = 0;

  @HALDeserializeFrom('value_type')
  valueType!: ValueType;

  nullable: boolean = false;

  inputInstructions: string = '';

  modifiable: boolean = false;
}
