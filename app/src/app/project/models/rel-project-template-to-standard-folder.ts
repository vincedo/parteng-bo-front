import { HALDeserializeFrom } from '@app/core/services/hal-serializer.service';
import { StandardFolder2 } from './standard-folder.model';

export class RelProjectTemplateToStandardFolder {
  @HALDeserializeFrom()
  project_templates_id: number = 0;

  @HALDeserializeFrom()
  standard_folders_id: number = 0;

  @HALDeserializeFrom()
  standard_folder!: StandardFolder2;

  @HALDeserializeFrom()
  status: number = 0;
}
