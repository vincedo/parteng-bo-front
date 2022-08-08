import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { InstrumentVersion } from '@app/data-entry/models/instrument-version.model';
import { Instrument2 } from '@app/data-entry/models/instrument.model';
import { SettingsService } from '@app/data-entry/services/settings.service';

@Component({
  selector: 'parteng-instruments-versions-table',
  template: `
    <table
      mat-table
      [dataSource]="dataSource"
      matSort
      [trackBy]="trackInstrumentById"
      [fixedLayout]="true"
      class="w-full instruments-list-table"
    >
      <!-- Order -->
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500 w-[75px]">
          {{ 'dataEntry.pageInstrumentUpdate.instrumentVersionsTable.columnNumber' | translate }}
        </th>
        <td mat-cell *matCellDef="let instrumentVersion" class="text-xs">
          {{ instrumentVersion.order }}
        </td>
      </ng-container>
      <!-- effectiveDate -->
      <ng-container matColumnDef="effectiveDate">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500">
          {{ 'dataEntry.pageInstrumentUpdate.instrumentVersionsTable.columnEffectiveDate' | translate }}
        </th>
        <td mat-cell *matCellDef="let instrumentVersion" class="text-xs">
          {{ instrumentVersion.effectiveDate | date: 'shortDate' }}
        </td>
      </ng-container>
      <!-- Name -->
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500">
          {{ 'dataEntry.pageInstrumentUpdate.instrumentVersionsTable.columnInstrumentName' | translate }}
        </th>
        <td mat-cell *matCellDef="let instrumentVersion" class="text-xs">
          {{ instrument?.name }}
        </td>
      </ng-container>
      <!-- Project -->
      <ng-container matColumnDef="project">
        <th mat-header-cell *matHeaderCellDef class="text-blue-ptg-secondary-500">
          {{ 'dataEntry.pageInstrumentUpdate.instrumentVersionsTable.columnCreationProject' | translate }}
        </th>
        <td mat-cell *matCellDef="let instrumentVersion" class="text-xs">
          {{ instrumentVersion.creationProject?.long_name }}
        </td>
      </ng-container>
      <!-- Status -->
      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef class="text-blue-ptg-secondary-500 w-[75px]">
          {{ 'dataEntry.pageInstrumentUpdate.instrumentVersionsTable.columnStatus' | translate }}
        </th>
        <td mat-cell *matCellDef="let instrumentVersion" class="text-xs">
          <mat-icon>{{ isValidated(instrumentVersion) ? 'lock' : 'lock_open' }}</mat-icon>
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
export class InstrumentVersionsTableComponent {
  @ViewChild(MatSort) sort!: MatSort;

  @Input() instrument: Instrument2 | undefined;
  @Input() selectedVersion: InstrumentVersion | undefined;

  @Output() rowClicked = new EventEmitter<InstrumentVersion>();

  displayedColumns = ['id', 'effectiveDate', 'name', 'project', 'status'];
  dataSource: MatTableDataSource<InstrumentVersion> = new MatTableDataSource<InstrumentVersion>([]);

  constructor(private settingsService: SettingsService) {}

  ngOnInit() {
    this.dataSource = new MatTableDataSource<InstrumentVersion>(
      (this.instrument?.instrumentVersions || []).sort((b, a) => a.order - b.order)
    );
    this.dataSource.sort = this.sort;
  }

  trackInstrumentById(index: number, instrumentVersion: InstrumentVersion): number {
    return instrumentVersion.id;
  }

  isSelected(instrumentVersion: InstrumentVersion): boolean {
    return this.selectedVersion?.id === instrumentVersion.id;
  }

  isValidated(instrumentVersion: InstrumentVersion): boolean {
    return instrumentVersion.validationStatus === this.settingsService.get<number>('VALIDATION_STATUS_VALIDATED');
  }

  clickRow(instrumentVersion: InstrumentVersion): void {
    this.selectedVersion = instrumentVersion;
    this.rowClicked.emit(instrumentVersion);
  }
}
