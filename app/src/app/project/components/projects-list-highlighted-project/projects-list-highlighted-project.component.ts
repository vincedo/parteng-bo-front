import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

import { Project } from '@app/project/models';

@Component({
  selector: 'parteng-projects-list-highlighted-project',
  templateUrl: './projects-list-highlighted-project.component.html',
  styleUrls: ['./projects-list-highlighted-project.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsListHighlightedProjectComponent {
  @Input() project: Project | undefined;
}
