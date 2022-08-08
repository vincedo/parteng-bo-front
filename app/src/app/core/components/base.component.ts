import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Title } from '@angular/platform-browser';

import { Subscription } from 'rxjs';

import { Store } from '@ngrx/store';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslateService } from '@ngx-translate/core';

import { AppInjector } from '@app/app-injector';
import { ConfigService } from '../services/config.service';

@Component({ template: '' })
export abstract class BaseComponent {
  protected router!: Router;
  protected titleService!: Title;
  protected store!: Store;
  protected spinner!: NgxSpinnerService;
  protected translate!: TranslateService;
  protected config!: ConfigService;
  protected appName!: string;

  public pageTitle = '';

  protected subscriptions: Subscription[] = [];

  constructor() {
    const injector = AppInjector.getInjector();
    this.router = injector.get(Router);
    this.titleService = injector.get(Title);
    this.store = injector.get(Store);
    this.spinner = injector.get(NgxSpinnerService);
    this.translate = injector.get(TranslateService);
    this.config = injector.get(ConfigService);
    // this.appName = this.config.get('appName');
  }

  protected setPageTitle(title: string): void {
    this.pageTitle = title;
    this.titleService.setTitle(title);
  }

  protected addSubscription(sub: Subscription): void {
    this.subscriptions.push(sub);
  }

  protected unsubscribeAll(): void {
    this.subscriptions.map((s) => s.unsubscribe());
    this.subscriptions = [];
  }
}
