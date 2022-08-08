import { Component, OnInit } from '@angular/core';

import { BaseComponent } from '@app/core/components';
import { Project } from '@app/project/models';
import { ProjectService } from '@app/project/services/project.service';

import * as projectFormActions from '@app/project/store/project-form.actions';
import * as projectFormSelectors from '@app/project/store/project-form.selectors';

@Component({
  selector: 'parteng-page-projects-list',
  templateUrl: './page-projects-list.component.html',
  styleUrls: ['./page-projects-list.component.scss'],
})
export class PageProjectsListComponent extends BaseComponent implements OnInit {
  projectsListState$ = this.store.select(projectFormSelectors.selectProjectsListState);

  // constructor(private projectService2: ProjectService2) {
  //   super();
  // }

  ngOnInit(): void {
    this.store.dispatch(projectFormActions.loadProjectsList());
    // this.projectService2.getById$(24).subscribe((PROJECTS) => console.log(`PROJECTS`, PROJECTS));
  }

  /**
   * @TODO
   * In a perfect world, we should not have to receive the "project click" event here.
   * We have to do this because the backend does not yet return rel_projects_to_goals_to_persons
   * when loading the projects list and we need to show the goal persons in the "Détails du projet" area
   * when a project is clicked... We should refactor this once the backend is able to return to full data.
   *
   * @param project Undefined when resetting the highlighted project
   *                (which happens when user filters the projects list)
   */
  onProjectClicked(project?: Project): void {
    if (project) {
      this.store.dispatch(projectFormActions.loadProjectHighlightedInProjectsList({ projectId: project?.id }));
    } else {
      this.store.dispatch(projectFormActions.resetProjectHighlightedInProjectsList());
    }
  }

  gotoProject(project?: Project): void {
    if (project) {
      this.store.dispatch(projectFormActions.gotoEditProject({ project }));
    }
  }
}
