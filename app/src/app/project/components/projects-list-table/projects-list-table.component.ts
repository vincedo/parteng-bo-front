import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  ViewChild,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';

import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Project, ProjectItem } from '@app/project/models';
import { VALIDATION_STATUS } from '@app/shared/models';
import { DBLCLICK_THRESHOLD_MS } from '@app/shared/shared.constants';

@Component({
  selector: 'parteng-projects-list-table',
  templateUrl: './projects-list-table.component.html',
  styleUrls: ['./projects-list-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsListTableComponent implements AfterViewInit, OnDestroy {
  @ViewChild(MatSort) sort!: MatSort;

  @Input() set projects(data: ProjectItem[]) {
    this.dataSource = new MatTableDataSource<ProjectItem>(data);
    if (this.sort) {
      this.dataSource.sort = this.sort;
    }
  }
  @Input() highlightedProject: Project | undefined;

  @Output() rowClicked = new EventEmitter<ProjectItem>();
  @Output() rowDblClicked__DEPREC = new EventEmitter<ProjectItem>();

  displayedColumns = ['id', 'name', 'scopeCodesStr', 'ordinary', 'date_min', 'date_max', 'validation_status'];
  dataSource!: MatTableDataSource<ProjectItem>;

  private timeout: number | undefined;
  private countDownInProgress = false;

  private clickedProjectItem!: ProjectItem;

  ngAfterViewInit(): void {
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.clearTimeout();
  }

  trackProjectById(index: number, item: ProjectItem): number {
    return item.id;
  }

  clickRow(projectItem: ProjectItem): void {
    this.clickedProjectItem = projectItem;
    this.registerClick();
  }

  isValidated(projectItem: ProjectItem): boolean {
    return projectItem.validation_status === VALIDATION_STATUS.VALIDATED;
  }

  isHighlighted(projectItem: ProjectItem): boolean {
    return this.highlightedProject?.id === projectItem.id;
  }

  private registerClick(): void {
    if (!this.countDownInProgress) {
      this.countDownInProgress = true;
      this.timeout = window.setTimeout(() => {
        this.countDownInProgress = false;
        this.rowClicked.emit(this.clickedProjectItem);
      }, DBLCLICK_THRESHOLD_MS);
    } else {
      this.clearTimeout();
      this.countDownInProgress = false;
      this.rowDblClicked__DEPREC.emit(this.clickedProjectItem);
    }
  }

  private clearTimeout(): void {
    if (this.timeout) {
      window.clearTimeout(this.timeout);
    }
  }
}
