import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'parteng-project-form-block',
  templateUrl: './project-form-block.component.html',
  styleUrls: ['./project-form-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectFormBlockComponent {
  @Input() title!: string;
  @Input() editIconName: string = 'edit'; // name of the <mat-icon> to use as the edit icon
  @Input() canEdit!: boolean; // true if the user has the permission to edit
  @Input() editAsToggle = false; // If true, the user can toggle between edit mode and non-edit mode
  @Input() isDisabled!: boolean;
  @Input() numItems!: number;
  @Input() isActive = false;

  @Output() editClicked = new EventEmitter<void>();
  @Output() cancelEditClicked = new EventEmitter<void>();

  isEditMode = false;

  edit(): void {
    if (!this.canEdit) return;

    if (this.editAsToggle) {
      this.isEditMode = true;
    }
    this.editClicked.emit();
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.cancelEditClicked.emit();
  }
}
