import { HALDeserializeFrom } from '@app/core/services/hal-serializer.service';
import { EntityWithId } from '@app/shared/models';
import { RelProjectTemplateToGoal } from './rel-project-template-to-goal';
import { RelProjectTemplateToStandardFolder } from './rel-project-template-to-standard-folder';

export class ProjectTemplate2 extends EntityWithId {
  @HALDeserializeFrom()
  override status: number = 0;

  @HALDeserializeFrom()
  override id: number = 0;

  @HALDeserializeFrom()
  name: string = '';

  @HALDeserializeFrom('project_name_template')
  projectNameTemplate: string = '';

  @HALDeserializeFrom()
  order: number = 0;

  @HALDeserializeFrom()
  comment: string = '';

  @HALDeserializeFrom('project_templates_to_standard_folders', RelProjectTemplateToStandardFolder)
  relProjectTemplateToStandardFolders: RelProjectTemplateToStandardFolder[] = [];

  @HALDeserializeFrom('project_templates_to_goals', RelProjectTemplateToGoal)
  relProjectTemplateToGoals: RelProjectTemplateToGoal[] = [];
}
