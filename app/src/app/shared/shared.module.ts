import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TranslateModule } from '@ngx-translate/core';
import { AngularMaterialModule } from './angular-material.module';
import { BreadcrumbComponent } from './components/breadcrumb.component';
import { DialogCloseWarningComponent } from './components/dialog-close-warning.component';
import { DialogFundManagerSelectorSharedComponent } from './components/dialog-fund-manager-selector/dialog-fund-manager-selector-shared.component';
import { DialogInstrumentSelectorSharedComponent } from './components/dialog-instrument-selector-shared/dialog-instrument-selector-shared.component';
// Item Selector
import { DialogItemSelectorComponent } from './components/dialog-item-selector/dialog-item-selector.component';
import { DialogLeaveWarningComponent } from './components/dialog-leave-warning.component';
import { DialogPersonCreationComponent } from './components/dialog-person-creation/dialog-person-creation.component';
import { DialogPersonsSelectorComponent } from './components/dialog-persons-selector/dialog-persons-selector.component';
import { DialogScopeFormSharedComponent } from './components/dialog-scope-form-shared/dialog-scope-form-shared.component';
import { DialogScopeSelectorSharedComponent } from './components/dialog-scope-selector-shared/dialog-scope-selector-shared.component';
import { DialogWarningCustomTextComponent } from './components/dialog-warning-custom-text.component';
import { DialogWarningComponent } from './components/dialog-warning.component';
// Dialogs
import { DialogComponent } from './components/dialog.component';
import { DynamicInputComponent } from './components/dynamic-input.component';
import { EntityCreatedUpdatedInfoComponent } from './components/entity-created-updated-info.component';
import { ErrorMessageBlockComponent } from './components/error-block.component';
import { GenericDialogComponent } from './components/generic-dialog/generic-dialog.component';
import { ItemSelectorTableComponent } from './components/item-selector-table/item-selector-table.component';
import { ListFiltersComponent } from './components/list-filters.component';
import { MultiCheckboxesFilterFieldComponent } from './components/multi-checkboxes-filter-field.component';
// Form Fields
import { MultiRadiosFilterFieldComponent } from './components/multi-radios-filter-field.component';
import { PageTitleComponent } from './components/page-title.component';
import { PartengDatePickerComponent } from './components/parteng-datepicker.component';
// Components
import { PartengHeaderComponent } from './components/parteng-header.component';
import { PersonAdditionalInfoComponent } from './components/person-additional-info/person-additional-info.component';
import { PersonFormSharedComponent } from './components/person-form-shared/person-form-shared.component';

import { PersonsListComponent } from './components/persons-list.component';
import { PersonsTableComponent } from './components/persons-table.component';
import { ResetFiltersButtonComponent } from './components/reset-filters-button.component';
import { ScopeForm2Component } from './components/scope-form2/scope-form2.component';
import { ScopesListComponent } from './components/scopes-list.component';
import { ScopesTableComponent } from './components/scopes-table.component';
// Pipes
import { ApplyPipePipe } from './pipes/apply-pipe.pipe';
import { DashOnEmptyPipe } from './pipes/dash-on-empty.pipe';
import { FundTypePipe } from './pipes/fund-type.pipe';
import { GetObjPropInObjListPipe } from './pipes/get-obj-prop-in-obj-list.pipe';
import { LegalEntityTypePipe } from './pipes/legal-entity-type.pipe';
import { PersonQualityPipe } from './pipes/person-quality.pipe';
import { PersonTypeToTranslatedLabelPipe } from './pipes/person-type-to-translated-label.pipe';
import { SecondsToMillisecondsPipe } from './pipes/seconds-to-milliseconds.pipe';
// Directives
import { AuthorisableDirective } from './directives/authorisable.directive';

const reexportedModules = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterModule,
  TranslateModule,
  AngularMaterialModule,
];
const components = [
  PartengHeaderComponent,
  PageTitleComponent,
  BreadcrumbComponent,
  ErrorMessageBlockComponent,
  EntityCreatedUpdatedInfoComponent,

  // Dialogs
  DialogComponent,
  DialogWarningComponent,
  DialogCloseWarningComponent,
  DialogLeaveWarningComponent,
  DialogWarningCustomTextComponent,
  GenericDialogComponent,

  // Scopes
  DialogScopeSelectorSharedComponent,
  DialogScopeFormSharedComponent,
  ScopeForm2Component,
  ScopesListComponent,
  ScopesTableComponent,

  // Form Fields
  MultiRadiosFilterFieldComponent,
  MultiCheckboxesFilterFieldComponent,
  ResetFiltersButtonComponent,
  DynamicInputComponent,
  ListFiltersComponent,

  // Item Selector
  DialogItemSelectorComponent,
  ItemSelectorTableComponent,
  PersonAdditionalInfoComponent,
  DialogPersonsSelectorComponent,

  //
  PartengDatePickerComponent,
  PersonFormSharedComponent,
  DialogPersonCreationComponent,
  DialogFundManagerSelectorSharedComponent,
  DialogFundManagerSelectorSharedComponent,
  DialogInstrumentSelectorSharedComponent,

  // Persons
  PersonsListComponent,
  PersonsTableComponent,
];
const pipes = [
  ApplyPipePipe,
  PersonTypeToTranslatedLabelPipe,
  SecondsToMillisecondsPipe,
  GetObjPropInObjListPipe,
  FundTypePipe,
  LegalEntityTypePipe,
  PersonQualityPipe,
  DashOnEmptyPipe,
];
const directives = [AuthorisableDirective];

@NgModule({
  imports: [...reexportedModules],
  exports: [...reexportedModules, ...components, ...pipes, ...directives],
  declarations: [...components, ...pipes, ...directives],
  providers: [DatePipe, ...pipes], // make pipes injectable with DI
})
export class SharedModule {}
