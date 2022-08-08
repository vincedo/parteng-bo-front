import { createReducer, on } from '@ngrx/store';
import * as _ from 'lodash';

import { PartengHelper } from '@app/core/helpers';
import {
  Goal,
  Person,
  LegalEntityType,
  FundType,
  Project,
  ProjectTemplate2,
  StandardFolder2,
  project2CreateNew,
  project2ApplyTemplate,
  World,
} from '../models';
import { computeProjectFormSlice, ProjectFormState, projectFormStateDefaults } from './project-form-state-helper';

import * as projectFormActions from './project-form.actions';

export interface State {
  projectsList: {
    allProjects: Project[];
    highlightedProject: Project | undefined;
    backendError: string;
  };
  // main form
  projectForm: ProjectFormState;
  // related domain data
  db: {
    allTemplates: ProjectTemplate2[];
    // allScopes: Scope2[];
    allWorlds: World[];
    allGoals: Goal[];
    allPersons: Person[];
    allLegalEntityTypes: LegalEntityType[];
    allFundTypes: FundType[];
    allStandardFolders: StandardFolder2[];
  };
  // This is more of a setting than a state value, but we need to put this here
  // because we can't use hardcoded values in the selectors.
  defaults: {
    hideAddItemButtonInItemSelector: boolean;
  };
}

export const initialState: State = {
  projectsList: {
    allProjects: [],
    highlightedProject: undefined,
    backendError: '',
  },
  // main form
  projectForm: { ...projectFormStateDefaults },
  // related domain data
  db: {
    allTemplates: [],
    // allScopes: [],
    allWorlds: [],
    allGoals: [],
    allPersons: [],
    allLegalEntityTypes: [],
    allFundTypes: [],
    allStandardFolders: [],
  },
  defaults: {
    hideAddItemButtonInItemSelector: false,
  },
};

//
//
//

export const reducer = createReducer(
  initialState,

  //
  // ---------- Projects List
  //

  on(
    projectFormActions.loadProjectsList,
    (state): State => ({
      ...state,
      projectsList: { ...initialState.projectsList },
      projectForm: { ...initialState.projectForm },
    })
  ),
  on(
    projectFormActions.loadProjectsListSuccess,
    (state, { allProjects }): State => ({
      ...state,
      projectsList: {
        allProjects,
        highlightedProject: state.projectsList.highlightedProject,
        backendError: state.projectsList.backendError,
      },
    })
  ),
  on(
    projectFormActions.loadProjectsListError,
    (state, { error }): State => ({
      ...state,
      projectsList: {
        allProjects: state.projectsList.allProjects,
        highlightedProject: state.projectsList.highlightedProject,
        backendError: PartengHelper.formatHttpError(error),
      },
    })
  ),
  on(
    projectFormActions.loadProjectHighlightedInProjectsListSuccess,
    (state, { project }): State => ({
      ...state,
      projectsList: {
        allProjects: state.projectsList.allProjects,
        highlightedProject: project,
        backendError: state.projectsList.backendError,
      },
    })
  ),
  on(
    projectFormActions.loadProjectHighlightedInProjectsListError,
    (state, { error }): State => ({
      ...state,
      projectsList: {
        allProjects: state.projectsList.allProjects,
        highlightedProject: initialState.projectsList.highlightedProject,
        backendError: PartengHelper.formatHttpError(error),
      },
    })
  ),
  on(
    projectFormActions.resetProjectHighlightedInProjectsList,
    (state): State => ({
      ...state,
      projectsList: {
        allProjects: state.projectsList.allProjects,
        highlightedProject: initialState.projectsList.highlightedProject,
        backendError: state.projectsList.backendError,
      },
    })
  ),

  //
  // ---------- Project Form
  //

  on(
    projectFormActions.loadProjectFormDataSuccess,
    (
      state,
      {
        project,
        allTemplates,
        // allScopes,
        allWorlds,
        allGoals,
        allPersons,
        allLegalEntityTypes,
        allFundTypes,
        allStandardFolders,
      }
    ): State => {
      const isNew = project === undefined;
      const currentProject = project || project2CreateNew();
      return {
        ...state,
        projectForm: computeProjectFormSlice(state.projectForm, { project: currentProject, isNew, reset: true }),
        db: {
          allTemplates,
          // allScopes,
          allWorlds,
          allGoals,
          allPersons,
          allLegalEntityTypes,
          allFundTypes,
          allStandardFolders,
        },
      };
    }
  ),

  //
  // ---------- Project Entity
  //

  on(projectFormActions.validateProjectTemplate, (state, { templateId }): State => {
    // Apply the chosen template, if any, to the current project
    if (templateId !== undefined) {
      const template = state.db.allTemplates.find((t) => t.id === templateId)!;
      const project = project2ApplyTemplate(state.projectForm.project, template);
      return {
        ...state,
        projectForm: computeProjectFormSlice(state.projectForm, { project, templateId, wasTemplateApplied: true }),
      };
    } else {
      return {
        ...state,
        projectForm: computeProjectFormSlice(state.projectForm, { wasTemplateApplied: true }),
      };
    }
  }),
  on(
    projectFormActions.changeProjectIdentification,
    (state, { ordinary, name, comment }): State => ({
      ...state,
      projectForm: computeProjectFormSlice(state.projectForm, {
        project: state.projectForm.project.clone({ ordinary, name, comment }),
        projectIdentificationChanged: true,
      }),
    })
  ),
  on(
    projectFormActions.submitProjectIdentification,
    (state, { project }): State => ({
      ...state,
      projectForm: computeProjectFormSlice(state.projectForm, {
        project,
        projectIdentificationSubmitted: true,
      }),
    })
  ),
  on(
    projectFormActions.saveProjectDraftSuccess,
    (state, { project }): State => ({
      ...state,
      projectForm: computeProjectFormSlice(state.projectForm, { project }),
    })
  ),
  on(
    projectFormActions.saveProjectSuccess,
    (state): State => ({
      ...state,
      projectForm: computeProjectFormSlice(state.projectForm, { reset: true }),
    })
  ),
  on(
    projectFormActions.saveProjectError,
    (state, { error }): State => ({
      ...state,
      projectForm: computeProjectFormSlice(state.projectForm, {
        backendError: PartengHelper.formatHttpError(error),
      }),
    })
  ),
  on(
    projectFormActions.deleteProjectSuccess,
    (state): State => ({
      ...state,
      projectForm: computeProjectFormSlice(state.projectForm, { reset: true }),
    })
  ),
  on(
    projectFormActions.cancelProjectFormSuccess,
    (state): State => ({
      ...state,
      projectForm: computeProjectFormSlice(state.projectForm, { reset: true }),
    })
  ),

  //
  // ---------- Project Scopes
  //

  on(projectFormActions.submitSelectedScopesForProject, (state, { scopes }): State => {
    scopes = _.sortBy(scopes, 'code');
    return {
      ...state,
      projectForm: computeProjectFormSlice(state.projectForm, {
        project: state.projectForm.project.clone({ scopes }),
        projectScopesSubmitted: true,
      }),
    };
  }),

  //
  // ---------- Project Goals
  //

  // Validating selected goals will add them to the project
  on(projectFormActions.validateSelectedGoals, (state, { goals, selectedGoalsChanged }): State => {
    return {
      ...state,
      projectForm: computeProjectFormSlice(state.projectForm, {
        project: state.projectForm.project.updateGoals(goals),
      }),
    };
  }),
  on(projectFormActions.updateProjectGoal, (state, { relProjectToGoal }): State => {
    return {
      ...state,
      projectForm: computeProjectFormSlice(state.projectForm, {
        project: state.projectForm.project.updateRelProjectToGoal(relProjectToGoal),
      }),
    };
  }),
  on(projectFormActions.removeProjectGoal, (state, { goal }): State => {
    return {
      ...state,
      projectForm: computeProjectFormSlice(state.projectForm, {
        project: state.projectForm.project.removeGoal(goal),
      }),
    };
  }),

  //
  // ---------- Project Folders
  //

  on(
    projectFormActions.saveProjectFolder,
    (state, { folder, folderIndex }): State => ({
      ...state,
      projectForm: computeProjectFormSlice(state.projectForm, {
        project: state.projectForm.project.saveProjectFolder(folder, folderIndex),
        isFoldersSubmitted: true,
        wasDialogFolderFormAndListOpenedBefore: true,
      }),
    })
  ),
  on(
    projectFormActions.removeProjectFolder,
    (state, { folderIndex }): State => ({
      ...state,
      projectForm: computeProjectFormSlice(state.projectForm, {
        project: state.projectForm.project.removeProjectFolder(folderIndex),
      }),
    })
  ),
  on(
    projectFormActions.reorderProjectFolders,
    (state, { folders }): State => ({
      ...state,
      projectForm: computeProjectFormSlice(state.projectForm, {
        project: state.projectForm.project.reorderProjectFolders(folders),
      }),
    })
  )
);
