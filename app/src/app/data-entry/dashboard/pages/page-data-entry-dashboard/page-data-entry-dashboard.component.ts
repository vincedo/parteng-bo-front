import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/core/components';
import { filter, map, switchMap, tap } from 'rxjs';
import { DataEntryDashboardDataService } from '../../services/data-entry-dashboard-data.service';

@Component({
  selector: 'parteng-page-data-entry-dashboard',
  template: `
    <ng-container *ngIf="dashboard$ | async as dashboard">
      <div class="page-data-entry-dashboard h-full">
        <div class="page-header py-4 border-b shadow-2xl z-50">
          <div class="mx-6">
            <parteng-data-entry-breadcrumb
              [project]="project$ | async"
              [breadcrumb]="[]"
            ></parteng-data-entry-breadcrumb>
          </div>
        </div>

        <div class="flex h-full">
          <div class="flex flex-col w-1/5 bg-white px-8 pt-6">
            <parteng-data-entry-dashboard-side-menu
              [project]="project$ | async"
              [selectedFolder]="dashboard.folder"
            ></parteng-data-entry-dashboard-side-menu>
          </div>
          <div class="flex flex-col w-4/5 bg-gray-ptg-2 pt-6 px-4">
            <router-outlet></router-outlet>
          </div>
        </div>
      </div>
    </ng-container>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageDataEntryDashboardComponent extends BaseComponent {
  projectId: number = 0;

  dashboard$ = this.route.params.pipe(
    filter((params) => !!params['projectId']),
    map((params) => [params['projectId'], params['folderId']]),
    switchMap(([projectId, folderId]) => this.dataEntryDashboardDataService.getData$(projectId, folderId))
  );

  project$ = this.dashboard$.pipe(
    filter((state) => !!state.project),
    map((state) => state.project),
    tap((project) => {
      this.projectId = project.id;
      const pageTitle = project.longName;
      this.setPageTitle(pageTitle);
    })
  );

  constructor(private route: ActivatedRoute, private dataEntryDashboardDataService: DataEntryDashboardDataService) {
    super();
  }
}
