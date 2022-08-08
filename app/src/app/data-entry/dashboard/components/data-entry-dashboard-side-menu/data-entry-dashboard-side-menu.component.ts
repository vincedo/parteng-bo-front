import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { BaseComponent } from '@app/core/components';
import { PSEUDO_FOLDER } from '@app/data-entry/models/pseudo-folder.model';
import { InstrumentService2 } from '@app/data-entry/services/instrument2.service';
import {
  DialogProjectSelectorComponent,
  DialogProjectSelectorComponentResult,
} from '@app/project/dialogs/dialog-project-selector/dialog-project-selector.component';
import { Folder, PERSON_TYPE } from '@app/project/models';
import { PersonService } from '@app/project/services/person.service';
import { VALIDATION_STATUS } from '@app/shared/models';
import { DIALOG_WIDTH_LARGE } from '@app/shared/shared.constants';
import { TranslateService } from '@ngx-translate/core';
import { lastValueFrom } from 'rxjs';
import { PermissionService } from '@core/services/permission.service';

@Component({
  selector: 'parteng-data-entry-dashboard-side-menu',
  templateUrl: './data-entry-dashboard-side-menu.component.html',
  styleUrls: ['./data-entry-dashboard-side-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DataEntryDashboardSideMenuComponent extends BaseComponent {
  PROJECT_NOT_REVIEWED = VALIDATION_STATUS.NOT_REVIEWED;
  FOLDER_NOT_REVIEWED = VALIDATION_STATUS.NOT_REVIEWED;
  PERSON_TYPE = PERSON_TYPE;
  PSEUDO_FOLDER = PSEUDO_FOLDER;

  @Input() project: any;
  @Input() selectedFolder!: PSEUDO_FOLDER | Folder;

  @Output() selectFolder = new EventEmitter<PSEUDO_FOLDER | Folder>();

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private instrumentService: InstrumentService2,
    private personService: PersonService,
    private translateService: TranslateService,
    public readonly permissionService: PermissionService
  ) {
    super();
  }

  canTransfer(): boolean {
    return (
      this.project.validation_status === VALIDATION_STATUS.NOT_REVIEWED &&
      this.selectedFolder instanceof Folder &&
      this.selectedFolder.validationStatus === VALIDATION_STATUS.NOT_REVIEWED
    );
  }

  canPlan(): boolean {
    return false;
  }

  canAddInstrument(): boolean {
    return this.project.validation_status === VALIDATION_STATUS.NOT_REVIEWED;
  }

  canAddInstrumentVersion(): boolean {
    return this.project.validation_status === VALIDATION_STATUS.NOT_REVIEWED;
  }

  canAddPerson(): boolean {
    return this.project.validation_status === VALIDATION_STATUS.NOT_REVIEWED;
  }

  openProjectSelector(): void {
    this.dialog.open<DialogProjectSelectorComponent, undefined, DialogProjectSelectorComponentResult>(
      DialogProjectSelectorComponent,
      { width: DIALOG_WIDTH_LARGE, height: '90%' }
    );
  }

  navigateTo(destination: string[]): void {
    this.router.navigate(destination, { relativeTo: this.route });
  }

  async openAddPersonForm(personType: PERSON_TYPE) {
    await lastValueFrom(this.personService.showPersonDialog({ mode: 'create', project: this.project, personType }));
  }

  async addInstrumentVersion() {
    const r = await lastValueFrom(
      this.instrumentService.showInstrumentSelectorDialog({
        title: this.translateService.instant('dataEntry.pageDashboard.dialogInstrumentSelector.title'),
        description: this.translateService.instant('dataEntry.pageDashboard.dialogInstrumentSelector.description'),
      })
    );
    if (r) {
      this.router.navigate(['data-entry', 'projects', this.project.id, 'instruments', r[0].id], {
        queryParams: { readonly: 1 },
      });
    }
  }
}
