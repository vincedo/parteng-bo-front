/**
 * @file
 * Abstract class used to create Parteng-friendly form dialog components.
 *
 * @see [FormDocumentation](/app/docs/forms.md)
 */
import { AfterViewInit, Component, OnDestroy, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { Observable, Subscription } from 'rxjs';
import { AbstractDialogComponent } from './abstract-dialog.component';
import { AbstractFormComponent } from './abstract-form.component';

@Component({ template: '' })
export abstract class AbstractFormDialogComponent<R = any>
  extends AbstractDialogComponent<R>
  implements AfterViewInit, OnDestroy
{
  @ViewChild(AbstractFormComponent) abstract formComponent: AbstractFormComponent<R>;

  form!: FormGroup;
  isFormInvalid = true;

  private formSub!: Subscription;

  abstract formState$: Observable<any>;

  /**
   * NB. dialogRef must be passed manually from child component
   * cause we can't inject it manually with AppInjector.getInjector().
   */
  constructor(dialogRef: MatDialogRef<AbstractFormDialogComponent<R>, R>) {
    super(dialogRef);
  }

  ngAfterViewInit(): void {
    this.syncWithChildForm();
  }

  ngOnDestroy(): void {
    this.formSub.unsubscribe();
  }

  //
  // ----- Local props and methods to interact with child form -----
  //

  private syncWithChildForm(): void {
    this.form = this.formComponent.form;
    this.formSub = this.form.valueChanges.subscribe(() => this.updateDialogOnFormChange());
    this.updateDialogOnFormChange();
  }

  /**
   * Whenever the form changes, update some stuff in the parent dialog.
   */
  private updateDialogOnFormChange(): void {
    // Sync a local `isDirty` prop with `form.dirty`
    if (this.form.dirty) {
      this.markAsDirty();
    }
    this.isFormInvalid = this.form.invalid;
  }

  /**
   * Use this when the dialog needs to trigger a submit of its child form.
   * The child form component will emit a (formSubmitted) output.
   */
  triggerFormSubmit(): void {
    this.formComponent.submit();
  }

  abstract onFormSubmitted(result: R, ...args: any[]): void;
}
