import {
  HALDate,
  HALDeserializeFrom,
  HALSerializeTo,
  HALSerializeValueToNewValue,
} from '@app/core/services/hal-serializer.service';
import { Project } from '@app/project/models';
import { VALIDATION_STATUS } from '@app/shared/models';
import { Attribute } from './attribute.model';

export class InstrumentVersion {
  @HALDeserializeFrom()
  id: number = 0;

  @HALDeserializeFrom()
  @HALSerializeTo()
  name: string = '';

  @HALDeserializeFrom()
  order: number = 0;

  @HALDeserializeFrom()
  @HALSerializeTo()
  changes: string = '';

  @HALDeserializeFrom('validation_status')
  @HALSerializeTo('validation_status')
  validationStatus: VALIDATION_STATUS = VALIDATION_STATUS.NOT_REVIEWED;

  @HALDeserializeFrom()
  @HALSerializeTo()
  status: number = 0;

  @HALDeserializeFrom('creation_projects_id')
  @HALSerializeTo('creation_projects_id')
  @HALSerializeValueToNewValue(0, null)
  creationProjectId: number = 0;

  @HALDeserializeFrom('project')
  creationProject!: Project;

  @HALDeserializeFrom('effective_date')
  @HALSerializeTo('effective_date')
  @HALDate()
  effectiveDate: Date | undefined;

  @HALDeserializeFrom('instruments_id')
  @HALSerializeTo('instruments_id')
  instrumentId: number = 0;

  @HALSerializeTo()
  @HALDeserializeFrom('attributes', Attribute)
  attributes: Attribute[] = [];
}
