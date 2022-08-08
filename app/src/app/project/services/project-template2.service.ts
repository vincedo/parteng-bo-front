import { Injectable } from '@angular/core';

import _ from 'lodash';
import { Observable, map } from 'rxjs';

import { HalApiService } from '@app/core/services/hal-api.service';
import { ProjectTemplate2 } from '../models';

@Injectable({ providedIn: 'root' })
export class ProjectTemplateService2 {
  constructor(private halApiService: HalApiService) {}

  getAll$(): Observable<ProjectTemplate2[]> {
    return this.halApiService
      .getCollection$(ProjectTemplate2, '/project-templates', { sets: 'full' }, 'project_templates')
      .pipe(map((projectTemplates) => _.sortBy(projectTemplates, 'order')));
  }
}
