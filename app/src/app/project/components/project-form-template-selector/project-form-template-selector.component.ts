import { Component, ChangeDetectionStrategy, Input, Output, EventEmitter } from '@angular/core';

import { ProjectTemplate2 } from '@app/project/models';

@Component({
  selector: 'parteng-project-form-template-selector',
  templateUrl: './project-form-template-selector.component.html',
  styleUrls: ['./project-form-template-selector.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectFormTemplateSelectorComponent {
  @Input() projectTemplate: ProjectTemplate2 | undefined;
  @Input() allProjectTemplates!: ProjectTemplate2[];
  @Input() isDisabled!: boolean;

  @Output() validateSelectedTemplate = new EventEmitter<number>();

  selectedTemplateId!: number;

  get selectedTemplateName(): string {
    if (this.selectedTemplateId === 0) {
      return 'Pas de modèle';
    } else if (this.selectedTemplateId > 0) {
      return this.allProjectTemplates.find((t) => t.id === this.selectedTemplateId)!.name;
    } else {
      return '---';
    }
  }

  // NB. The choice could be "no template"
  changeTemplateChoice(event: Event): void {
    const templateId = Number((event.target as HTMLSelectElement).value);
    this.selectedTemplateId = templateId;
  }

  // NB. The choice could be "no template"
  submitTemplateChoice(): void {
    this.validateSelectedTemplate.emit(this.selectedTemplateId || undefined);
  }
}
