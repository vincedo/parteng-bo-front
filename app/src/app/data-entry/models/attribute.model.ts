import {
  HALDeserializeFrom,
  HALSerializeTo,
  HALSerializeValueToNewValue,
} from '@app/core/services/hal-serializer.service';
import { Person } from '@app/project/models';
import { AttributeType } from './attribute-type.model';
import { Instrument2 } from './instrument.model';

export class Attribute {
  @HALDeserializeFrom()
  @HALSerializeTo()
  id: number | undefined;

  @HALDeserializeFrom()
  @HALSerializeTo()
  status: number = 0;

  @HALDeserializeFrom('instrument_versions_id')
  @HALSerializeTo('instrument_versions_id')
  @HALSerializeValueToNewValue(0, null)
  instrumentVersionId: number = 0;

  @HALDeserializeFrom('attribute_types_id')
  @HALSerializeTo('attribute_types_id')
  @HALSerializeValueToNewValue(0, null)
  attributeTypeId: number = 0;

  attributeType!: AttributeType;

  @HALDeserializeFrom('scalar_value')
  @HALSerializeTo('scalar_value')
  // Might be a date as an ISO string
  scalarValue: number | string | boolean | undefined;

  @HALDeserializeFrom('persons_id')
  @HALSerializeTo('persons_id')
  @HALSerializeValueToNewValue(0, null)
  personId: number = 0;

  @HALDeserializeFrom('person')
  person: Person | undefined;

  @HALDeserializeFrom('repayment_types_id')
  @HALSerializeTo('repayment_types_id')
  @HALSerializeValueToNewValue(0, null)
  repaymentTypeId: number | undefined;

  @HALDeserializeFrom('instruments_id')
  @HALSerializeTo('instruments_id')
  @HALSerializeValueToNewValue(0, null)
  instrumentId: number | undefined;

  @HALDeserializeFrom('instrument')
  instrument: Instrument2 | undefined;
}
