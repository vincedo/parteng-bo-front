import { Component, ChangeDetectionStrategy, Input, EventEmitter, Output } from '@angular/core';
import { Person, Project } from '@app/project/models';
import { PersonService } from '@app/project/services/person.service';
import { ProjectLight } from '@app/project/services/project-and-folder-light.service';

import { Store } from '@ngrx/store';
import { lastValueFrom } from 'rxjs';

import { TransferPerson } from '../../models';
import { PersonField } from '../../store/person-field.state';

import * as transferActions from '../../store/transfer.actions';

@Component({
  selector: 'parteng-transfer-person-field',
  templateUrl: './transfer-person-field.component.html',
  styleUrls: ['./transfer-person-field.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferPersonFieldComponent {
  @Input() index!: number;
  @Input() personField!: PersonField;
  @Input() transferPerson!: TransferPerson;
  @Input() parentProject!: ProjectLight;
  @Input() isEditable = true;
  @Input() isActive!: boolean;

  @Output() activate = new EventEmitter<void>();

  constructor(private store: Store, private personService: PersonService) {}

  async clickOpenPersonSelector(personIndex: number): Promise<void> {
    this.activate.emit();
    const persons: Person[] | undefined = await lastValueFrom(
      this.personService.showPersonSelectorDialog({
        project: this.parentProject as unknown as Project,
        title: 'dataEntry.pageTransferForm.dialogPersonSelector.title',
        titleName: this.personField.personQualityStr,
        description: 'dataEntry.pageTransferForm.dialogPersonSelector.description',
      })
    );
    if (persons) {
      this.store.dispatch(transferActions.submitSelectedPersonForTransfer({ personIndex, person: persons[0] }));
    }
  }
}
