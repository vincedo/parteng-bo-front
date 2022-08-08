import {
  Component,
  ChangeDetectionStrategy,
  Input,
  OnChanges,
  SimpleChanges,
  EventEmitter,
  Output,
} from '@angular/core';

import { JsHelper } from '@app/core/helpers';
import { Project } from '@app/project/models';
import { project2ToProjectItem, ProjectItem, projectToProjectItem } from '@app/project/models/project-item.model';

@Component({
  selector: 'parteng-projects-list',
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsListComponent implements OnChanges {
  @Input() allProjects: Project[] = [];
  @Input() highlightedProject: Project | undefined;
  @Input() statusFilter = -1;
  @Input() backendError!: string;

  @Output() projectClicked = new EventEmitter<Project | undefined>();

  allProjectItems: ProjectItem[] = [];
  filteredProjectItems: ProjectItem[] = [];
  textFilter = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['allProjects']) {
      this.allProjectItems = this.allProjects.map((project) => project2ToProjectItem(project));
      this.updateFilteredProjects();
    }
  }

  //

  onProjectClicked(projectItem: ProjectItem): void {
    const project = this.getProjectForProjectItem(projectItem);
    this.projectClicked.emit(project);
    // what to do with the highlighted project?
    // this.highlightedProject = this.getProjectForProjectItem(projectItem);
  }

  onTextFilterChanged(textFilter: string): void {
    this.updateFilteredProjects({ textFilter });
  }

  onStatusFilterChanged(statusFilter: number): void {
    this.updateFilteredProjects({ statusFilter });
  }

  private updateFilteredProjects(filters: { textFilter?: string; statusFilter?: number } = {}): void {
    this.projectClicked.emit(); // emit nothing to reset the highlighted project
    // this.highlightedProject = undefined; // searching resets highlighted project

    if (filters.textFilter !== undefined) this.textFilter = filters.textFilter;
    if (filters.statusFilter !== undefined) this.statusFilter = filters.statusFilter;

    this.filteredProjectItems =
      this.textFilter !== '' || this.statusFilter !== -1
        ? this.allProjectItems.filter((project) =>
            this.filterProjectFn(project, { textFilter: this.textFilter, statusFilter: this.statusFilter })
          )
        : [...this.allProjectItems];
  }

  // Return true if the given project matches the given filters
  private filterProjectFn(project: ProjectItem, filters: { textFilter?: string; statusFilter?: number }): boolean {
    const projectContainsText = filters.textFilter
      ? JsHelper.ObjPropsContainString(project, filters.textFilter, [
          'id',
          'name',
          'scopeCodesStr',
          'scopesStr',
          'goalsStr',
          'comment',
        ])
      : true;
    const projectHasStatus =
      filters.statusFilter !== undefined && filters.statusFilter !== -1
        ? project.validation_status === filters.statusFilter
        : true;
    return projectContainsText && projectHasStatus;
  }

  private getProjectForProjectItem(projectItem: ProjectItem): Project {
    return this.allProjects.find((p) => p.id === projectItem.id)!;
  }
}
