import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

import { from, of } from 'rxjs';
import { exhaustMap, map, catchError, mergeMap } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import { Actions, concatLatestFrom, createEffect, ofType } from '@ngrx/effects';
import { TranslateService } from '@ngx-translate/core';

import { DIALOG_WIDTH_LARGE, DIALOG_WIDTH_SMALL } from '@app/shared/shared.constants';

import { ProjectFormDataService } from '../services/project-form-data.service';

import {
  DialogGoalSelectorComponent,
  DialogGoalSelectorResult,
} from '../dialogs/dialog-goal-selector/dialog-goal-selector.component';
import {
  DialogProjectScopesChangedWarningComponent,
  DialogProjectScopesChangedWarningResult,
} from '../dialogs/dialog-project-scopes-changed-warning/dialog-project-scopes-changed-warning.component';
import { ProjectService } from '../services/project.service';

import * as coreActions from '@app/core/store/core.actions';
import * as projectFormActions from './project-form.actions';
import * as projectFormSelectors from '@app/project/store/project-form.selectors';

@Injectable()
export class ProjectFormEffects {
  //
  // ----- Projects List -----
  //

  loadProjectsList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectFormActions.loadProjectsList),
      mergeMap(() =>
        this.projectService.getAll$().pipe(
          map((allProjects) => projectFormActions.loadProjectsListSuccess({ allProjects })),
          catchError((error: HttpErrorResponse) => of(projectFormActions.loadProjectsListError({ error })))
        )
      )
    );
  });

  loadProjectHighlightedInProjectsList$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectFormActions.loadProjectHighlightedInProjectsList),
      mergeMap(({ projectId }) =>
        this.projectService.getById$(projectId).pipe(
          map((project) => projectFormActions.loadProjectHighlightedInProjectsListSuccess({ project })),
          catchError((error: HttpErrorResponse) =>
            of(projectFormActions.loadProjectHighlightedInProjectsListError({ error }))
          )
        )
      )
    );
  });

  gotoEditProject$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(projectFormActions.gotoEditProject),
        map(({ project }) => this.router.navigate(['/projects/update', project.id]))
      );
    },
    { dispatch: false }
  );

  // -------------------- Project Selector

  selectProjectForDataEntry$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(projectFormActions.selectProjectForDataEntry),
        map(({ project }) => this.router.navigate(['/data-entry/projects', project.id]))
      );
    },
    { dispatch: false }
  );

  //
  // ----- Project Form -----
  //

  loadProjectFormData$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectFormActions.loadProjectFormData),
      mergeMap(({ projectId }) =>
        this.projectFormDataService.getData$(projectId).pipe(
          // tap((DATA) => console.log(`PROJECT FORM DATA`, DATA)),
          map((data) => projectFormActions.loadProjectFormDataSuccess(data)),
          catchError((error: HttpErrorResponse) => of(projectFormActions.loadProjectFormDataError({ error })))
        )
      )
    );
  });

  validateProjectTemplateAndSaveProject$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectFormActions.validateProjectTemplate),
      concatLatestFrom(() => this.store.select(projectFormSelectors.selectProjectFormState)),
      map(([action, projectFormState]) =>
        action.templateId
          ? projectFormActions.saveProjectAsDraft({ project: projectFormState.project })
          : coreActions.noOp()
      )
    );
  });

  // If the project is new, submitting the project identification info
  // will save the project as a draft to obtain a project.id.
  submitProjectIdentification$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectFormActions.submitProjectIdentification),
      map(({ project }) => (!project.id ? projectFormActions.saveProjectAsDraft({ project }) : coreActions.noOp()))
    );
  });

  saveProjectAsDraft$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectFormActions.saveProjectAsDraft),
      mergeMap(({ project }) =>
        this.projectService.saveAsDraft$(project).pipe(
          map((savedProject) => projectFormActions.saveProjectDraftSuccess({ project: savedProject })),
          catchError((error: HttpErrorResponse) => of(projectFormActions.saveProjectError({ error })))
        )
      )
    );
  });

  saveProject$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectFormActions.saveProject, projectFormActions.saveProjectAsActive),
      mergeMap(({ project }) =>
        this.projectService.saveAsActive$(project).pipe(
          map((savedProject) => projectFormActions.saveProjectSuccess({ project: savedProject })),
          catchError((error: HttpErrorResponse) => of(projectFormActions.saveProjectError({ error })))
        )
      )
    );
  });

  deleteProject$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectFormActions.deleteProject),
      mergeMap(({ project }) =>
        this.projectService.delete$(project).pipe(
          map(() => projectFormActions.deleteProjectSuccess()),
          catchError((error: HttpErrorResponse) => of(projectFormActions.deleteProjectError({ error })))
        )
      )
    );
  });

  redirectToProjectsListAfterSave$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectFormActions.saveProjectSuccess),
      map(() => this.router.navigate(['/projects/list'])),
      map(() =>
        coreActions.openSnackbar({ message: this.translate.instant('project.pageProjectForm.projectWasSaved') })
      )
    );
  });

  redirectToProjectsListAfterDelete$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectFormActions.deleteProjectSuccess),
      map(() => this.router.navigate(['/projects/list'])),
      map(() =>
        coreActions.openSnackbar({ message: this.translate.instant('project.pageProjectForm.projectWasDeleted') })
      )
    );
  });

  cancelProjectForm$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectFormActions.cancelProjectForm),
      mergeMap(() => from(this.router.navigate(['/projects/list']))),
      map((navigationSucceeded) =>
        navigationSucceeded ? projectFormActions.cancelProjectFormSuccess() : coreActions.noOp()
      )
    );
  });

  //
  // ----- Scope Selector -----
  //

  submitSelectedScopesForProject$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectFormActions.submitSelectedScopesForProject),
      concatLatestFrom(() => this.store.select(projectFormSelectors.selectProjectFormState)),
      map(([action, projectFormState]) =>
        projectFormState.formSectionsState.isFoldersSubmitted
          ? projectFormActions.openDialogProjectScopesChangedWarning()
          : coreActions.noOp()
      )
    );
  });

  openDialogProjectScopesChangedWarning$ = createEffect(
    () => {
      return this.actions$.pipe(
        ofType(projectFormActions.openDialogProjectScopesChangedWarning),
        exhaustMap(() => {
          const dialogRef = this.dialog.open<
            DialogProjectScopesChangedWarningComponent,
            undefined,
            DialogProjectScopesChangedWarningResult
          >(DialogProjectScopesChangedWarningComponent, { width: DIALOG_WIDTH_SMALL });
          return dialogRef.afterClosed();
        }),
        map((dialogResult) => {
          if (dialogResult) {
            this.router.navigate([], { fragment: 'projectFoldersBlock' });
          }
        })
      );
    },
    { dispatch: false }
  );

  //
  // ----- Goal Selector -----
  //

  openDialogGoalSelectorFromProjectForm$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(projectFormActions.openDialogGoalSelectorFromProjectPage),
      exhaustMap(() => {
        const dialogRef = this.dialog.open<DialogGoalSelectorComponent, undefined, DialogGoalSelectorResult>(
          DialogGoalSelectorComponent,
          { width: DIALOG_WIDTH_LARGE }
        );
        return dialogRef.afterClosed();
      }),
      map((goalSelectorResult) =>
        goalSelectorResult
          ? projectFormActions.validateSelectedGoals(goalSelectorResult)
          : projectFormActions.dialogGoalSelectorClosed()
      )
    );
  });

  //
  // ----- Spinner -----
  //

  showSpinner$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        projectFormActions.loadProjectsList,
        projectFormActions.loadProjectHighlightedInProjectsList,
        projectFormActions.loadProjectFormData
      ),
      map(() => coreActions.showSpinner())
    );
  });

  hideSpinner$ = createEffect(() => {
    return this.actions$.pipe(
      ofType(
        projectFormActions.loadProjectsListSuccess,
        projectFormActions.loadProjectsListError,
        projectFormActions.loadProjectHighlightedInProjectsListSuccess,
        projectFormActions.loadProjectHighlightedInProjectsListError,
        projectFormActions.loadProjectFormDataSuccess,
        projectFormActions.loadProjectFormDataError,
        projectFormActions.saveProjectSuccess,
        projectFormActions.saveProjectError
      ),
      map(() => coreActions.hideSpinner())
    );
  });

  //

  constructor(
    private actions$: Actions,
    private store: Store,
    private router: Router,
    private dialog: MatDialog,
    private translate: TranslateService,
    private projectService: ProjectService,
    private projectFormDataService: ProjectFormDataService
  ) {}
}
