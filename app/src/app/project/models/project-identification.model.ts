/**
 * @file
 * The 3 fields in the "Project Identification" section of the project form.
 */
import { PROJECT_ORDINARY } from './project-ordinary.enum';

export interface ProjectIdentification {
  ordinary: PROJECT_ORDINARY;
  name: string;
  comment: string;
}
