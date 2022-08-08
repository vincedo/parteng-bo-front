/**
 * @file
 * Interface for component classes holding a form.
 *
 * This lets us handle form components more generically.
 */
import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DOCUMENT } from '@angular/common';

import { Subscription } from 'rxjs';

import { AppInjector } from '@app/app-injector';

@Component({ template: '' })
export abstract class AbstractFormComponent<R = any> implements OnInit, OnChanges, OnDestroy {
  @Input() backendError!: string;

  @Output() formSubmitted = new EventEmitter<R>();
  @Output() resetBackendError = new EventEmitter<void>();

  form!: FormGroup;

  protected fb!: FormBuilder;
  private sub!: Subscription;
  private document!: Document;

  constructor() {
    const injector = AppInjector.getInjector();
    this.fb = injector.get(FormBuilder);
    this.document = injector.get(DOCUMENT);
  }

  ngOnInit(): void {
    this.buildForm();
    this.watchStatusChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['backendError'] && !changes['backendError'].firstChange) {
      this.scrollToTop();
    }
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  //

  abstract buildForm(): void;

  submit(): void {
    const result = this.serializeForm();
    this.formSubmitted.emit(result);
  }

  // Convert the form data into a ready-to-consume format.
  abstract serializeForm(): R;

  private watchStatusChanges(): void {
    this.sub = this.form.statusChanges.subscribe(() => {
      if (this.backendError) {
        this.resetBackendError.emit();
      }
    });
  }

  // Scroll to show error displayed at the top of the form
  protected scrollToTop(): void {
    const formTop: HTMLElement = this.document.querySelector('#formTop')!;
    if (formTop) {
      formTop.scrollIntoView();
    }
  }
}
