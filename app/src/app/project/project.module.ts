import { NgModule } from '@angular/core';

// Store
import { StoreModule } from '@ngrx/store';
import { projectModuleReducers, featureKey } from './store';
import { EffectsModule } from '@ngrx/effects';
import { ProjectFormEffects } from './store/project-form.effects';

// Modules
import { SharedModule } from '@shared/shared.module';
import { ProjectRoutingModule } from './project-routing.module';

// Projects List
import { PageProjectsListComponent } from './pages/page-projects-list/page-projects-list.component';
import { ProjectsListComponent } from './components/projects-list/projects-list.component';
import { ProjectsListFiltersComponent } from './components/projects-list-filters/projects-list-filters.component';
import { ProjectsListTableComponent } from './components/projects-list-table/projects-list-table.component';
import { ProjectsListHighlightedProjectComponent } from './components/projects-list-highlighted-project/projects-list-highlighted-project.component';
import { DialogProjectSelectorComponent } from './dialogs/dialog-project-selector/dialog-project-selector.component';
// Project Form
import { PageProjectFormComponent } from './pages/page-project-form/page-project-form.component';
import { ProjectFormComponent } from './forms/project-form/project-form.component';
import { ProjectFormTemplateSelectorComponent } from './components/project-form-template-selector/project-form-template-selector.component';
import { ProjectFormRelatedItemsBlockComponent } from './components/project-form-related-items-block/project-form-related-items-block.component';
import { ProjectFormBlockComponent } from './components/project-form-block/project-form-block.component';
import { HowToCreateProjectComponent } from './components/how-to-create-project/how-to-create-project.component';
import { HowToModifyProjectComponent } from './components/how-to-modify-project/how-to-modify-project.component';
import { HowToBoxComponent } from './components/how-to-box/how-to-box.component';
// Scopes
import { ScopeSelectorWidgetComponent } from './components/scope-selector-widget/scope-selector-widget.component';
import { DialogProjectScopesChangedWarningComponent } from './dialogs/dialog-project-scopes-changed-warning/dialog-project-scopes-changed-warning.component';
// Goal Selector & Enricher
import { DialogGoalSelectorComponent } from './dialogs/dialog-goal-selector/dialog-goal-selector.component';
import { GoalListCheckboxesComponent } from './components/goal-list-checkboxes/goal-list-checkboxes.component';
// Person Selectors
import { PersonSelectorWidgetComponent } from './components/person-selector-widget/person-selector-widget.component';
// Folder Form & List
import { DialogFolderFormComponent } from './dialogs/dialog-folder-form/dialog-folder-form.component';
import { FolderFormComponent } from './forms/folder-form/folder-form.component';
import { DialogGoalEnricherComponent } from './dialogs/dialog-goal-enricher/dialog-goal-enricher.component';
import { GoalEnricherFormComponent } from './forms/goal-enricher-form/goal-enricher-form.component';

@NgModule({
  imports: [
    ProjectRoutingModule,
    SharedModule,
    StoreModule.forFeature(featureKey, projectModuleReducers),
    EffectsModule.forFeature([ProjectFormEffects]),
  ],
  declarations: [
    // Projects List
    PageProjectsListComponent,
    ProjectsListComponent,
    ProjectsListFiltersComponent,
    ProjectsListTableComponent,
    ProjectsListHighlightedProjectComponent,
    DialogProjectSelectorComponent,
    // Project Form
    PageProjectFormComponent,
    ProjectFormComponent,
    ProjectFormTemplateSelectorComponent,
    ProjectFormRelatedItemsBlockComponent,
    ProjectFormBlockComponent,
    HowToCreateProjectComponent,
    HowToModifyProjectComponent,
    HowToBoxComponent,
    // Scopes
    ScopeSelectorWidgetComponent,
    DialogProjectScopesChangedWarningComponent,
    // Goal Selector & Enricher
    DialogGoalSelectorComponent,
    GoalListCheckboxesComponent,
    // Person Selectors
    PersonSelectorWidgetComponent,
    // Folder Form & List
    DialogFolderFormComponent,
    FolderFormComponent,
    DialogGoalEnricherComponent,
    GoalEnricherFormComponent,
  ],
})
export class ProjectModule {}
