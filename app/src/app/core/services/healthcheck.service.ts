import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';

import { Observable, map, tap, forkJoin, of } from 'rxjs';

import { EnvironmentInfo } from '../models';
import { WINDOW } from '../core.module';
import { ConfigService } from './config.service';
import { PrefetchDataService } from './prefetch-data.service';
import { PartengHelper } from '../helpers';

import { environment } from '../../../environments/environment';
import packageJson from '../../../../package.json';

@Injectable({ providedIn: 'root' })
export class HealthcheckService {
  private envName!: string;

  constructor(
    private http: HttpClient,
    @Inject(WINDOW) window: Window,
    private config: ConfigService,
    private prefetchDataService: PrefetchDataService
  ) {
    this.envName = PartengHelper.getEnvNameFromHostName(window.location.hostname);
  }

  checkAndPrefetchData(): Observable<any> {
    return forkJoin([this.setEnvironmentInfoFromHealthcheckHeaders(), this.prefetchAndCacheData()]);
  }

  private setEnvironmentInfoFromHealthcheckHeaders() {
    const url = `${environment.api.baseURL}/healthcheck`;
    const headers = new HttpHeaders({
      Accept: 'application/hal+json',
    });
    return this.http.get<any>(url, { headers, observe: 'response' }).pipe(
      map((httpResponse) => httpResponse.headers),
      tap((httpHeaders) => {
        const envInfo: EnvironmentInfo = {
          envName: this.envName,
          frontVersion: packageJson.version,
          frontCommitHash: packageJson.gitCommitHash,
          apiVersion: httpHeaders.get('x-application-version') || 'NOT_FOUND',
          apiCommitHash: httpHeaders.get('x-application-commit-hash') || 'NOT_FOUND',
        };
        this.config.setEnvironmentInfo(envInfo);
      })
    );
  }

  /**
   * Prefetch some data used throughout the app and store it in the config's cache.
   */
  private prefetchAndCacheData() {
    // return of(true);
    return this.prefetchDataService.fetch$().pipe(tap((DATA) => this.config.saveMultiInCache(DATA)));
  }
}
