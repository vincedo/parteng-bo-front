import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { Scope } from '@app/project/models';
import { VALIDATION_STATUS } from '@app/shared/models';
import { LegalEntityTypePipe } from '@app/shared/pipes/legal-entity-type.pipe';

@Component({
  selector: 'parteng-scopes-table',
  template: `
    <table
      mat-table
      [dataSource]="dataSource"
      matSort
      matSortDisableClear
      [trackBy]="trackScopeById"
      [fixedLayout]="true"
      class="w-full scopes-list-table"
    >
      <!-- Code -->
      <ng-container matColumnDef="code">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500 w-[85px]">
          {{ 'project.dialogScopeSelector.columnCode' | translate }}
        </th>
        <td mat-cell *matCellDef="let scope" class="text-xs">
          {{ cell(scope.code) }}
        </td>
      </ng-container>
      <!-- Name -->
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500">
          {{ 'project.dialogScopeSelector.columnName' | translate }}
        </th>
        <td mat-cell *matCellDef="let scope" class="text-xs">
          {{ cell(scope.name) }}
        </td>
      </ng-container>
      <!-- Historical Name(s) -->
      <ng-container matColumnDef="historicalName">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500 whitespace-pre-line">
          {{ 'project.dialogScopeSelector.columnHistoricalNames' | translate }}
        </th>
        <td mat-cell *matCellDef="let scope" class="text-xs">
          {{ cell(scope.historicalName) }}
        </td>
      </ng-container>
      <!-- Name -->
      <ng-container matColumnDef="city">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500">
          {{ 'project.dialogScopeSelector.columnCity' | translate }}
        </th>
        <td mat-cell *matCellDef="let scope" class="text-xs">
          {{ cell(scope.city) }}
        </td>
      </ng-container>
      <!-- ROW Templates (TR) -->
      <tr mat-header-row *matHeaderRowDef="displayedColumns; sticky: true"></tr>
      <tr
        mat-row
        *matRowDef="let row; columns: displayedColumns"
        (click)="clickRow(row)"
        class="select-none cursor-pointer"
        [class.bg-neutral-100]="isSelected(row)"
      ></tr>
    </table>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ScopesTableComponent implements OnChanges, AfterViewInit {
  @Input() scopes: Scope[] = [];
  @Input() selectedScope: Scope | undefined;

  @Output() rowClicked = new EventEmitter<Scope>();

  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['code', 'name', 'historicalName', 'city'];
  dataSource: MatTableDataSource<Scope> = new MatTableDataSource<Scope>([]);
  VALIDATION_STATUS = VALIDATION_STATUS;

  constructor(private legalEntityTypePipe: LegalEntityTypePipe, private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    changes && changes['scopes'] && this.setDataSource(this.scopes);
    changes && changes['selectedScope'] && this.cdr.detectChanges();
  }

  // Needed because mat-sort
  ngAfterViewInit(): void {
    this.setDataSource(this.scopes);
  }

  setDataSource(scopes: Scope[]) {
    this.dataSource = new MatTableDataSource<Scope>(scopes);
    this.dataSource.sort = this.sort;
    // this.dataSource.sortingDataAccessor = (item: Scope2, property): any => {
    //   return (
    //     {
    //       legal_entity_types_id: this.cell(this.legalEntityTypePipe.transform(item.legal_entity_types_id || 0)),
    //     }[property] || (item as any)[property]
    //   );
    // };
  }

  trackScopeById(index: number, scope: Scope): number {
    return scope.id;
  }

  cell(value: unknown) {
    return value || '-';
  }

  isSelected(scope: Scope): boolean {
    return this.selectedScope?.id === scope.id;
  }

  clickRow(scope: Scope): void {
    this.rowClicked.emit(scope);
  }
}
