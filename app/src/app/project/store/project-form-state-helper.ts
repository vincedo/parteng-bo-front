/**
 * @file
 * Helper function to compute the slice of the state containing the project form.
 */
import { Project } from '../models/project.model';

export interface ProjectFormSectionsState {
  isTemplateSelectorDisabled: boolean;
  isScopesDisabled: boolean;
  isProjectIdentificationDisabled: boolean;
  isProjectIdentificationSubmitted: boolean;
  isGoalsAndFoldersDisabled: boolean;
  isFoldersSubmitted: boolean;
  // isProjectGoalsSubmitted: boolean;
  // isFoldersDisabled: boolean;
}

const projectFormSectionsStateDefaults: ProjectFormSectionsState = {
  isTemplateSelectorDisabled: false,
  isScopesDisabled: true,
  isProjectIdentificationDisabled: true,
  isProjectIdentificationSubmitted: false,
  isGoalsAndFoldersDisabled: true,
  isFoldersSubmitted: false,
  // isProjectGoalsSubmitted: false,
  // isFoldersDisabled: true,
};

export interface ProjectFormState {
  project: Project;
  isNew: boolean; // true if the project in the form is a new project
  templateId: number | undefined;
  wasTemplateApplied: boolean;
  wasDialogFolderFormAndListOpenedBefore: boolean;
  formSectionsState: ProjectFormSectionsState;
  backendError: string;
}

export const projectFormStateDefaults: ProjectFormState = {
  project: undefined as any,
  isNew: true,
  templateId: undefined,
  wasTemplateApplied: false,
  wasDialogFolderFormAndListOpenedBefore: false,
  formSectionsState: { ...projectFormSectionsStateDefaults },
  backendError: '',
};

/**
 * Compute the `projectForm` slice of the state.
 */
export function computeProjectFormSlice(
  state: ProjectFormState,
  opts: {
    project?: Project;
    isNew?: boolean;
    // projectId?: number;
    templateId?: number;
    wasTemplateApplied?: boolean;
    wasDialogFolderFormAndListOpenedBefore?: boolean;
    projectIdentificationChanged?: boolean;
    projectIdentificationSubmitted?: boolean;
    projectScopesSubmitted?: boolean;
    isFoldersSubmitted?: boolean;
    // isProjectGoalsSubmitted?: boolean;
    backendError?: string;
    reset?: boolean;
  }
): ProjectFormState {
  if (opts.reset) {
    state = { ...projectFormStateDefaults };
  }

  const isNew = opts.isNew !== undefined ? opts.isNew : state.isNew;
  const templateId: number | undefined = opts.templateId !== undefined ? opts.templateId : state.templateId;
  const wasTemplateApplied = opts.wasTemplateApplied !== undefined ? opts.wasTemplateApplied : state.wasTemplateApplied;
  const wasDialogFolderFormAndListOpenedBefore =
    opts.wasDialogFolderFormAndListOpenedBefore !== undefined
      ? opts.wasDialogFolderFormAndListOpenedBefore
      : state.wasDialogFolderFormAndListOpenedBefore;

  let project: Project | undefined = opts.project || state.project;
  // Whenever the project identification is updated, copy the JS-generated long name
  // to the backend generated long name to make sure it's always current
  if (opts.projectIdentificationChanged) {
    project.longName = project.long_name_js;
  }
  // If we're dealing with a new project whose scopes were just submitted,
  // we need to update the project's scopes with the new scopes.
  if (isNew && opts.projectScopesSubmitted && !state.formSectionsState.isFoldersSubmitted) {
    const updatedProjectFolders = project.folders.map((folder) =>
      folder.clone({ scopes: project?.relProjectToScopes.map((rel) => rel.scope) })
    );
    project = project.clone({ folders: updatedProjectFolders });
  }

  return {
    project,
    isNew,
    templateId,
    wasTemplateApplied,
    wasDialogFolderFormAndListOpenedBefore,
    formSectionsState: computeFormSectionsState(state, {
      project,
      isNew,
      wasTemplateApplied,
      projectIdentificationChanged: opts.projectIdentificationChanged,
      projectIdentificationSubmitted: opts.projectIdentificationSubmitted,
      isFoldersSubmitted: opts.isFoldersSubmitted,
      // isProjectGoalsSubmitted: opts.isProjectGoalsSubmitted,
    }),
    backendError: opts.backendError || state.backendError,
  };
}

/**
 * Compute the state of misc sections in the project form.
 *    - All sections can be enabled/disabled.
 *    - Some sections can also be "submitted", meaning the user has manually
 *      submitted the values for the section. That's because when using a project template,
 *      a section can be pre-filled without the user having to manually enter the data. We want to force
 *      the user to manually re-submit the data before letting them move on to the next section.
 */
function computeFormSectionsState(
  state: ProjectFormState,
  data: {
    project?: Project;
    isNew: boolean;
    wasTemplateApplied: boolean;
    projectIdentificationChanged?: boolean;
    projectIdentificationSubmitted?: boolean;
    isFoldersSubmitted?: boolean;
    // isProjectGoalsSubmitted?: boolean;
  }
): ProjectFormSectionsState {
  const {
    project,
    isNew,
    wasTemplateApplied,
    projectIdentificationSubmitted,
    isFoldersSubmitted,
    // isProjectGoalsSubmitted,
  } = data;
  const newState: ProjectFormSectionsState = { ...state.formSectionsState };

  newState.isTemplateSelectorDisabled = wasTemplateApplied || state.formSectionsState.isTemplateSelectorDisabled;

  if (isNew) {
    const projectHasScopes = !!project && project.relProjectToScopes.length > 0;
    newState.isScopesDisabled = projectHasScopes ? false : !newState.isTemplateSelectorDisabled;
    newState.isProjectIdentificationDisabled = !projectHasScopes;
    newState.isProjectIdentificationSubmitted =
      projectIdentificationSubmitted ?? state.formSectionsState.isProjectIdentificationSubmitted;
    newState.isGoalsAndFoldersDisabled = projectIdentificationSubmitted
      ? false
      : state.formSectionsState.isGoalsAndFoldersDisabled;
    newState.isFoldersSubmitted = isFoldersSubmitted ?? state.formSectionsState.isFoldersSubmitted;
    // newState.isFoldersDisabled = isProjectGoalsSubmitted === true ? false : state.formSectionsState.isFoldersDisabled;
  } else {
    newState.isScopesDisabled = false;
    newState.isProjectIdentificationDisabled = false;
    newState.isProjectIdentificationSubmitted = true;
    newState.isGoalsAndFoldersDisabled = false;
    newState.isFoldersSubmitted = true;
    // newState.isFoldersDisabled = false;
    // newState.isProjectGoalsSubmitted = true;
  }

  return newState;
}
