import { HALDeserializeFrom } from '@app/core/services/hal-serializer.service';

export enum DataType {
  TEXT = 'DATA_TYPE_TEXT',
  ADDRESS = 'DATA_TYPE_ADDRESS',
  BOOLEAN = 'DATA_TYPE_BOOLEAN',
  CONTRACT_EVENT = 'DATA_TYPE_CONTRACT_EVENT',
  DATE = 'DATA_TYPE_DATE',
  FLOAT = 'DATA_TYPE_FLOAT',
  INSTRUMENT = 'DATA_TYPE_INSTRUMENT',
  INT = 'DATA_TYPE_INT',
  PERSON = 'DATA_TYPE_PERSON',
  REPAYMENT_TYPE = 'DATA_TYPE_REPAYMENT_TYPE',
}

export class ValueType {
  @HALDeserializeFrom()
  id: number = 0;

  @HALDeserializeFrom()
  name: string = '';

  @HALDeserializeFrom('data_type')
  dataType: number = 0;

  @HALDeserializeFrom('not_managed_in_current_version')
  notManagedInCurrentVersion: boolean = false;
}
