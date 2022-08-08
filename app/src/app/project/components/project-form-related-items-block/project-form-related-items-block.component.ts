import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter, TemplateRef, ViewChild } from '@angular/core';
import { CdkDrag, CdkDragDrop } from '@angular/cdk/drag-drop';

@Component({
  selector: 'parteng-project-form-related-items-block',
  templateUrl: './project-form-related-items-block.component.html',
  styleUrls: ['./project-form-related-items-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectFormRelatedItemsBlockComponent<ENTITY> {
  // Translated strings
  @Input() title!: string;
  @Input() addButtonLabel!: string;

  @Input() items!: ENTITY[];
  @Input() selectedItemPreviewHTML!: TemplateRef<{ item: ENTITY }>;
  @Input() isDisabled!: boolean;
  @Input() isNew!: boolean; // true if we're editing a new project
  @Input() isActive = false;
  @Input() editIconName: string = 'edit'; // name of the <mat-icon> to use as the edit icon
  @Input() canEdit!: boolean; // true if user has the permission to edit
  @Input() axis: 'horizontal' | 'vertical' = 'vertical';

  @Output() addEditButtonClicked = new EventEmitter<void>();
  @Output() draggedItemWasDropped = new EventEmitter<CdkDragDrop<ENTITY[]>>();

  @ViewChild(CdkDrag) cdkDrag!: CdkDrag;

  onDraggedItemWasDropped(event: CdkDragDrop<ENTITY[]>): void {
    this.draggedItemWasDropped.emit(event);
  }
}
