import { HttpErrorResponse } from '@angular/common/http';
import { createAction, props } from '@ngrx/store';

import { Scope, Goal, Folder, Project } from '../models';
import { ProjectIdentification } from '../models/project-identification.model';
import { RelProjectToGoal } from '../models/rel-project-to-goal';
import { ProjectFormData } from '../services/project-form-data.service';

//
// ---------- Projects List
//

export const loadProjectsList = createAction('[Projects List Page] Load all projects');
export const loadProjectsListSuccess = createAction(
  '[API] Projects list loaded successfully',
  props<{ allProjects: Project[] }>()
);
export const loadProjectsListError = createAction(
  '[API] Projects list failed to load',
  props<{ error: HttpErrorResponse }>()
);
export const loadProjectHighlightedInProjectsList = createAction(
  '[Projects List Page] Load project highlighted in projects list',
  props<{ projectId: number }>()
);
export const loadProjectHighlightedInProjectsListSuccess = createAction(
  '[Projects List Page] Project highlighted in projects list loaded successfully',
  props<{ project: Project }>()
);
export const loadProjectHighlightedInProjectsListError = createAction(
  '[Projects List Page] Project highlighted in projects list failed to load',
  props<{ error: HttpErrorResponse }>()
);
export const resetProjectHighlightedInProjectsList = createAction(
  '[Projects List Page] Reset project highlighted in projects list'
);
export const gotoEditProject = createAction(
  '[Projects List Page] Go to edit project page',
  props<{ project: Project }>()
);
// -------------------- Project Selector
export const selectProjectForDataEntry = createAction(
  '[Project Selector] Select project for data entry',
  props<{ project: Project }>()
);

//
// ---------- Project Form
//

export const loadProjectFormData = createAction(
  '[Project Form Page] Load project form data (undefined projectId for new projects)',
  props<{ projectId?: number }>()
);
export const loadProjectFormDataSuccess = createAction(
  '[API] Project form data loaded successfully',
  // eslint-disable-next-line ngrx/prefer-inline-action-props
  props<ProjectFormData>()
);
export const loadProjectFormDataError = createAction(
  '[API] Project form data failed to load',
  props<{ error: HttpErrorResponse }>()
);
export const validateProjectTemplate = createAction(
  '[Project Form Page] Validate the project template to apply',
  props<{ templateId?: number }>()
);
export const changeProjectIdentification = createAction(
  '[Project Form Page] Change project identification (ordinary, name or comment)',
  props<Partial<ProjectIdentification>>()
);
export const submitProjectIdentification = createAction(
  '[Project Form Page] Project identification (ordinary + name + comment) has been submitted',
  props<{ project: Project }>()
);
export const saveProjectAsDraft = createAction(
  '[Project Form Page] Save project as draft',
  props<{ project: Project }>()
);
export const saveProjectDraftSuccess = createAction(
  '[API] Save project as draft succeeded',
  props<{ project: Project }>()
);
export const saveProjectAsActive = createAction(
  '[Project Form Page] Save project and mark its status as "active"',
  props<{ project: Project }>()
);
export const saveProject = createAction('[Project Form Page] Save project', props<{ project: Project }>());
export const saveProjectSuccess = createAction('[API] Save project succeeded', props<{ project: Project }>());
export const saveProjectError = createAction('[API] Save project failed', props<{ error: HttpErrorResponse }>());
export const deleteProject = createAction('[Project Form Page] Delete project', props<{ project: Project }>());
export const deleteProjectSuccess = createAction('[API] Delete project succeeded');
export const deleteProjectError = createAction('[API] Delete project failed', props<{ error: HttpErrorResponse }>());
export const cancelProjectForm = createAction('[Project Form Page] Cancel project form');
export const cancelProjectFormSuccess = createAction('[Project Form Page] Cancel project form succeeded');

//
// ---------- Scope Selector
//

export const submitSelectedScopesForProject = createAction(
  '[Scope Selector Dialog] Submit selected scopes for current project',
  props<{ scopes: Scope[] }>()
);
export const openDialogProjectScopesChangedWarning = createAction(
  '[Project Form Page] Open dialog "project scopes changed warning"'
);

//
// ---------- Project Goals
//

export const openDialogGoalSelectorFromProjectPage = createAction('[Project Form Page] Open goal selector dialog');
export const dialogGoalSelectorClosed = createAction('[Goal Selector Dialog] Dialog closed');
export const validateSelectedGoals = createAction(
  '[Goal Selector Dialog] Validate selected goals',
  props<{ goals: Goal[]; selectedGoalsChanged: boolean }>()
);
export const updateProjectGoal = createAction(
  '[Project Form Page] Update the given goal in the project',
  props<{ relProjectToGoal: RelProjectToGoal }>()
);
export const removeProjectGoal = createAction(
  '[Project Form Page] Remove the given goal from the project',
  props<{ goal: Goal }>()
);

//
// ---------- Project Folders
//

export const saveProjectFolder = createAction(
  '[Project Form Page] Add or update the given folder in the project',
  props<{ folder: Folder; folderIndex?: number }>()
);
export const removeProjectFolder = createAction(
  '[Project Form Page] Remove the given folder from the project',
  props<{ folderIndex: number }>()
);
export const reorderProjectFolders = createAction(
  '[Project Form Page] Reorder project folders (used when reordering folders via drag & drop)',
  props<{ folders: Folder[] }>()
);
