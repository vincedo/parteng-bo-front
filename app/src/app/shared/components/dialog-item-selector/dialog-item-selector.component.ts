import {
  Component,
  ChangeDetectionStrategy,
  Input,
  TemplateRef,
  OnChanges,
  SimpleChanges,
  OnInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

import { Observable } from 'rxjs';

import { TableColumnDef } from '@app/core/models';
import { EntityWithId } from '@app/shared/models';
import { AbstractDialogComponent } from '@app/core/components';
import _ from 'lodash';

// Components projecting their content into this component must implement this interface.
export interface DialogItemSelector<ENTITY extends EntityWithId> {
  columnDefs: TableColumnDef[];
  itemSelectorState$: Observable<DialogItemSelectorState<ENTITY>>;
  filterItemFn: (item: ENTITY, filter: string) => boolean;
}

// ATTENTION. NO OPTIONAL PROPS ALLOWED BELOW AS THIS INTERFACE REPRESENTS A PIECE OF STATE
export interface DialogItemSelectorState<ENTITY extends EntityWithId> {
  // dialog data
  allItems: ENTITY[];
  selectedItems: ENTITY[];
  newItem: ENTITY;
  // dialog customisations
  forEntityName: string;
  dialogTitleTranskateKey: string;
  hideAddItemButton: boolean;
}

//

@Component({
  selector: 'parteng-dialog-item-selector',
  templateUrl: './dialog-item-selector.component.html',
  styleUrls: ['./dialog-item-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogItemSelectorComponent<ENTITY extends EntityWithId>
  extends AbstractDialogComponent<ENTITY[]>
  implements OnInit, OnChanges
{
  // Translated strings
  @Input() dialogTitle!: string;
  @Input() dialogDescription!: string;
  @Input() selectedItemsTitle!: string;
  @Input() selectedItemsDescription!: string;
  @Input() itemAdditionalInfoTitle!: string;

  // HTML Templates
  @Input() itemAdditionalInfoHTML!: TemplateRef<{ item: ENTITY }>;
  @Input() selectedItemPreviewHTML!: TemplateRef<{ item: ENTITY }>;

  // Data
  @Input() columnDefs!: TableColumnDef[];
  @Input() allItems: ENTITY[] = [];
  // NB. Items already selected the 1st time the dialog is opened.
  // Further changes are done LOCALLY on `selectedItems` and dispatched
  // back to the state only when the dialog is submitted.
  @Input() defaultSelectedItems: ENTITY[] = [];
  @Input() newItem!: ENTITY;
  @Input() filterItemFn!: (item: ENTITY, filter: string) => boolean;
  @Input() itemsSortProperty!: string; // name of a prop by which to sort the list of all items

  @Input() isMonoSelection = false; // If true, only one item can be selected at a time + the right column of "selected items" is not visible
  @Input() hideAddItemButton = false; // If true, the "Add Item" button will be hidden
  @Input() dialogColumnsSplitPoint: string = '4/6'; // The ratio of the dialog's width that will be used to split the columns.

  @ViewChild('selectedItemsDiv') selectedItemsDivRef!: ElementRef;

  selectedItems: ENTITY[] = [];
  get filteredItems(): ENTITY[] {
    return this.filterText
      ? this.allItems.filter((item) => this.filterItemFn(item, this.filterText))
      : [...this.allItems];
  }
  highlightedItem: ENTITY | undefined;
  filterText = '';

  // NB. This is the dialogRef of the projected component
  // we use it to keep the "close dialog" code in here
  constructor(dialogRef: MatDialogRef<DialogItemSelectorComponent<ENTITY>, ENTITY[]>) {
    super(dialogRef);
  }

  ngOnInit(): void {
    this.selectedItems = [...this.defaultSelectedItems];
    // Automatically add an invisible ColumnDef that will contain a checkmark for the selected column
    if (!this.isMonoSelection) {
      this.columnDefs = [...this.columnDefs, { key: 'selected', labelTranslateKey: '' }];
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['newItem'] && !changes['newItem'].firstChange) {
      this.resetFilter();
      this.selectItem(this.newItem);
    }
  }

  //

  onRowClicked(item: ENTITY): void {
    this.highlightedItem = item;
    // in mono-selection, single-click also selects the item
    if (this.isMonoSelection) {
      this.selectItem(item);
    }
  }

  /**
   * @deprecated
   */
  onRowDblClicked__DEPREC(item: ENTITY): void {
    // in mono-selection, double-click is like a single click
    if (this.isMonoSelection) {
      this.onRowClicked(item);
    } else {
      this.selectItem(item);
    }
  }

  onSelectHighlighted(): void {
    if (this.highlightedItem) {
      this.selectItem(this.highlightedItem);
      this.highlightedItem = undefined;
    }
  }

  selectItem(item: ENTITY): void {
    if (this.isMonoSelection) {
      this.selectedItems = [item];
    } else {
      // In multi-selection, selecting acts as a toggle
      this.toggleSelectedItem(item);
      this.scrollDownSelectedItemsList();
    }
    this.markAsDirty();
  }

  unselectItem(item: ENTITY): void {
    this.toggleSelectedItem(item);
    this.markAsDirty();
  }

  private toggleSelectedItem(item: ENTITY): void {
    const isSelected = this.selectedItems.some((i) => i.id === item.id);
    // If the item is already selected, remove it from selectedItems. Otherwise, add it.
    this.selectedItems = isSelected
      ? this.selectedItems.filter((i) => i.id !== item.id)
      : [...this.selectedItems, item];
    // If the item is already selected, add it to allItems. Otherwise, remove it.
    this.allItems = isSelected
      ? this.itemsSortProperty
        ? _.sortBy([...this.allItems, item], this.itemsSortProperty)
        : [...this.allItems, item]
      : this.allItems.filter((i) => i.id !== item.id);
  }

  submitSelectedItems(): void {
    this.submitAndCloseDialog(this.selectedItems);
  }

  // searching should reset the highlighted item
  onFilterTextChanged(): void {
    this.highlightedItem = undefined;
  }

  private resetFilter(): void {
    this.filterText = '';
    this.highlightedItem = undefined;
  }

  // scroll selected items list all the way down to make the last added item visible
  private scrollDownSelectedItemsList(): void {
    setTimeout(() => {
      const selectedItemsDiv: HTMLDivElement = this.selectedItemsDivRef?.nativeElement;
      if (selectedItemsDiv) {
        const scrollAmount = selectedItemsDiv.scrollHeight - selectedItemsDiv.clientHeight;
        selectedItemsDiv.scrollTop = scrollAmount;
      }
    });
  }
}
