import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { BaseComponent } from '@app/core/components';
import { Project } from '@app/project/models';
import { ProjectFormComponent } from '@app/project/forms/project-form/project-form.component';
import { ProjectIdentification } from '@app/project/models/project-identification.model';

import * as projectFormActions from '@app/project/store/project-form.actions';
import * as projectFormSelectors from '@app/project/store/project-form.selectors';

@Component({
  selector: 'parteng-page-project-form',
  templateUrl: './page-project-form.component.html',
  styleUrls: ['./page-project-form.component.scss'],
})
export class PageProjectFormComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild(ProjectFormComponent) formComponent!: ProjectFormComponent;

  isNew = true;
  formState$ = this.store.select(projectFormSelectors.selectProjectFormState);
  safeLeave = true; // If true, warn user when they try to leave on a dirty form

  constructor(private route: ActivatedRoute) {
    super();
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const projectId = id ? Number(id) : undefined;
    this.isNew = !projectId;

    this.store.dispatch(projectFormActions.loadProjectFormData({ projectId }));
  }

  ngOnDestroy(): void {
    this.unsubscribeAll();
  }

  // user has submitted its template choice (which could be "no template")
  // if a template was chosen, we have a default project.name
  // and we save project to obtain a project.id
  onValidateTemplateChoice(templateId?: number): void {
    this.store.dispatch(projectFormActions.validateProjectTemplate({ templateId }));
  }

  onProjectIdentificationChanged(identification: Partial<ProjectIdentification>): void {
    this.store.dispatch(projectFormActions.changeProjectIdentification(identification));
  }

  // If the project is new, submitting the project identification info
  // will save the project as a draft to obtain a project.id.
  onProjectIdentificationSubmitted(project: Project): void {
    this.store.dispatch(projectFormActions.submitProjectIdentification({ project }));
  }

  onFormSubmitted(project: Project): void {
    this.safeLeave = false;
    const action = this.isNew
      ? projectFormActions.saveProjectAsActive({ project })
      : projectFormActions.saveProject({ project });
    this.store.dispatch(action);
  }

  onDelete(project: Project): void {
    if (confirm(`Êtes-vous sûr(e) de vouloir supprimer le project "${project.name}" ?`)) {
      this.safeLeave = false;
      this.store.dispatch(projectFormActions.deleteProject({ project }));
    }
  }

  onCancel(): void {
    this.store.dispatch(projectFormActions.cancelProjectForm());
  }
}
