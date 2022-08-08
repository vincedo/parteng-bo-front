import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { InstrumentVersion } from '@app/data-entry/models/instrument-version.model';
import { Instrument2 } from '@app/data-entry/models/instrument.model';

@Component({
  selector: 'parteng-instruments-list-table',
  template: `
    <table
      mat-table
      [dataSource]="dataSource"
      matSort
      [trackBy]="trackInstrumentById"
      [fixedLayout]="true"
      class="w-full instruments-list-table"
    >
      <!-- ID -->
      <ng-container matColumnDef="id">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500 w-[75px]">
          {{ 'dataEntry.pageInstrumentsList.instrumentsTable.columnId' | translate }}
        </th>
        <td mat-cell *matCellDef="let instrument" class="text-xs">
          {{ instrument.id }}
        </td>
      </ng-container>
      <!-- Name -->
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500">
          {{ 'dataEntry.pageInstrumentsList.instrumentsTable.columnName' | translate }}
        </th>
        <td mat-cell *matCellDef="let instrument" class="text-xs">
          {{ instrument.name }}
        </td>
      </ng-container>
      <!-- effectiveDate -->
      <ng-container matColumnDef="effectiveDate">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500 whitespace-pre-line">
          {{ 'dataEntry.pageInstrumentsList.instrumentsTable.columnEffectiveDate' | translate }}
        </th>
        <td mat-cell *matCellDef="let instrument" class="text-xs">
          {{ getLastInstrumentVersion(instrument)?.effectiveDate | date: 'shortDate' }}
        </td>
      </ng-container>
      <!-- Project -->
      <ng-container matColumnDef="project">
        <th mat-header-cell *matHeaderCellDef mat-sort-header class="text-blue-ptg-secondary-500 whitespace-pre-line">
          {{ 'dataEntry.pageInstrumentsList.instrumentsTable.columnProject' | translate }}
        </th>
        <td mat-cell *matCellDef="let instrument" class="text-xs">
          {{ getLastInstrumentVersion(instrument)?.creationProject?.longName }}
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
export class InstrumentsListTableComponent {
  @Input() instruments: Instrument2[] = [];
  @Input() selectedInstrument: Instrument2 | undefined;

  @Output() rowClicked = new EventEmitter<Instrument2>();

  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns = ['id', 'name', 'effectiveDate', 'project'];
  dataSource: MatTableDataSource<Instrument2> = new MatTableDataSource<Instrument2>([]);

  ngOnChanges(changes: SimpleChanges) {
    changes && changes['instruments'] && this.setDataSource(this.instruments);
  }

  // Needed because mat-sort
  ngAfterViewInit(): void {
    this.setDataSource(this.instruments);
  }

  setDataSource(instruments: Instrument2[]) {
    this.dataSource = new MatTableDataSource<Instrument2>(instruments);
    this.dataSource.sort = this.sort;
    this.dataSource.sortingDataAccessor = (item: Instrument2, property): any => {
      switch (property) {
        case 'effectiveDate':
          return this.getLastInstrumentVersion(item)?.effectiveDate;
        case 'project':
          return this.getLastInstrumentVersion(item)?.creationProject?.name;
        default:
          return (item as any)[property];
      }
    };
  }

  getLastInstrumentVersion(instrument: Instrument2): InstrumentVersion {
    return (instrument.instrumentVersions || []).sort(
      (b, a) => a.effectiveDate!.getTime() - b.effectiveDate!.getTime()
    )[0];
  }

  trackInstrumentById(index: number, instrument: Instrument2): number {
    return instrument.id;
  }

  isSelected(instrument: Instrument2): boolean {
    return this.selectedInstrument?.id === instrument.id;
  }

  clickRow(instrument: Instrument2): void {
    this.rowClicked.emit(instrument);
  }
}
