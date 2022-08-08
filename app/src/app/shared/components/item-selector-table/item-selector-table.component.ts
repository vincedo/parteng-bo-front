import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ViewChild } from '@angular/core';

import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import { TableColumnDef } from '@app/core/models';
import { EntityWithId } from '@app/shared/models';

@Component({
  selector: 'parteng-item-selector-table',
  templateUrl: './item-selector-table.component.html',
  styleUrls: ['./item-selector-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemSelectorTableComponent<T extends EntityWithId> implements OnInit {
  @Input() columnDefs: TableColumnDef[] = [];
  @Input() set items(data: T[]) {
    this.dataSource = new MatTableDataSource(data);
    this.dataSource.sort = this.sort;
  }
  @Input() selectedItems: T[] = [];
  @Input() highlightedItem: T | undefined;

  @Output() rowClicked = new EventEmitter<T>();
  @Output() rowDblClicked = new EventEmitter<T>();

  @ViewChild(MatSort) sort!: MatSort;

  dataSource!: MatTableDataSource<any>;
  displayedColumns!: string[];

  ngOnInit(): void {
    this.displayedColumns = this.columnDefs.map((def) => def.key);
  }

  clickRow(item: T): void {
    this.rowClicked.emit(item);
  }

  dblclickRow(item: T): void {
    this.rowDblClicked.emit(item);
  }

  isSelected(item: T): boolean {
    return this.selectedItems.some((i) => i.id === item.id);
  }

  isHighlighted(item: T): boolean {
    return this.highlightedItem?.id === item.id;
  }
}
