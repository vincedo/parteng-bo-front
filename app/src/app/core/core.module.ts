// Import french locale
import { registerLocaleData } from '@angular/common';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import localeFr from '@angular/common/locales/fr';
import { APP_INITIALIZER, Inject, InjectionToken, LOCALE_ID, NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute } from '@angular/router';
import { SettingsService } from '@app/data-entry/services/settings.service';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NgxSpinnerModule } from 'ngx-spinner';
import { Observable, of, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { TaskComponent } from './components/task.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { TaskInterceptor } from './interceptors/http.interceptor';
import { HealthcheckService } from './services/healthcheck.service';
import { coreModuleReducers, featureKey } from './store';
import { CoreEffects } from './store/core.effects';
import { ServicesEffects } from './store/services.effects';
import { servicesReducer } from './store/services.reducers';
import { AuthorizedGuard } from '@core/guards/authorized.guard';
import { PermissionService } from '@core/services/permission.service';

export const WINDOW = new InjectionToken<Window>('window');

registerLocaleData(localeFr);

function initializeAppFactory(
  healthcheckService: HealthcheckService,
  settingsService: SettingsService,
  route: ActivatedRoute
): () => Observable<any> {
  return () => {
    // Dirty hack: we don't want any healthcheck or prefetch when we are coming
    // from Azure (login page if not connected, redirection if already connected).
    // TODO: split to an auth module and an app module, SRP on healthcheck (auth) and prefetch (app).
    if (window.location.pathname.includes('/oauth2')) {
      return of(true);
    }
    return healthcheckService.checkAndPrefetchData().pipe(switchMap((_) => settingsService.load$()));
  };
}

// AoT requires an exported function for factories
export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

@NgModule({
  imports: [
    // Core
    BrowserAnimationsModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    // Contrib
    StoreModule.forRoot(
      {},
      {
        runtimeChecks: {
          // That is so sad...
          // Ngrx is unable to manage subject in actions payloads,
          // so, when the ServicesStore dispatch an operation$ which is a subject
          // (this can be implied by switchMap, mergeMap, whatever needs an inner subscription),
          // the effect will add a subscriber to a property in the subject.
          // It then breaks immutability and triggers a Ngrx error.
          // Here, we disable this immutability rule.
          // One way to avoid this workaround whould have been to clone the operation$,
          // but unfortunatly the only RxJs function for this is from() which does not
          // clone but simply subscribe to the observable, thus breaking the immutability.
          strictActionImmutability: false,
        },
      }
    ),
    StoreModule.forFeature(featureKey, coreModuleReducers),
    StoreModule.forFeature('services', servicesReducer),
    StoreDevtoolsModule.instrument({
      maxAge: 25, // Retains last 25 states
      logOnly: environment.production, // Restrict extension to log-only mode
      autoPause: true, // Pauses recording actions and state changes when the extension window is not open
    }),
    EffectsModule.forRoot([CoreEffects, ServicesEffects]),
    TranslateModule.forRoot({
      defaultLanguage: 'fr',
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    NgxSpinnerModule,
  ],
  declarations: [TaskComponent],
  exports: [NgxSpinnerModule],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr-FR' },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [HealthcheckService, SettingsService, ActivatedRoute],
      multi: true,
    },
    { provide: WINDOW, useFactory: () => window },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TaskInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    AuthorizedGuard,
    PermissionService,
  ],
})
export class CoreModule {
  constructor(@Inject(LOCALE_ID) localeId: string, translate: TranslateService) {
    const langId = localeId.split('-')[0]; // localeId: {language_id}-{locale_extension}
    translate.setDefaultLang(langId);
  }
}
