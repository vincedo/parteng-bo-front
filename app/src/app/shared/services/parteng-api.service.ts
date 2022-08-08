/**
 * @file
 * Low-level REST service tailed for the Parteng API.
 */
import { map, Observable } from 'rxjs';

import { HttpHeaders, QueryParams, RestRequest } from '@app/core/models';
import { ResponseBody, RestService } from '@app/core/services';

import { Entity, EntityDto } from '../models/entity.model';
import { HALResource, HALResponse } from '../models/hal.models';
import { SerializerService } from './serializer.service';

import { environment } from '../../../environments/environment';

export abstract class PartengApiService<T extends Entity, U extends HALResource<EntityDto>> {
  /**
   *
   * @param rest Generic REST service
   * @param serializerService Serializer service specialized in the current entity type
   * @param _defaultEndpoint The REST endpoint for the entity without the base URL, e.g. "/scopes"
   * @param _halProperty The HAL property under which the data is stored { _embedded: { HALPROPERTY: __DATA__ } }
   *                     Example: "rel_projects_to_scopes"
   */
  constructor(
    protected readonly rest: RestService,
    protected readonly serializerService: SerializerService<T, U>,
    protected readonly _defaultEndpoint: string,
    private readonly _halProperty: string
  ) {}

  protected getCollection$(
    opts: { endpoint?: string; halProperty?: string; queryParams?: QueryParams } = {}
  ): Observable<T[]> {
    return this.getRawCollection$(opts).pipe(
      map((collection) => collection.map((halResource) => this.serializerService.fromDto(halResource)))
    );
  }

  protected getRawCollection$(
    opts: { endpoint?: string; halProperty?: string; queryParams?: QueryParams } = {}
  ): Observable<U[]> {
    return this.rest
      .get<HALResponse<U>>({ url: this.url(opts.endpoint), queryParams: opts.queryParams, headers: this.headers() })
      .pipe(
        map((response) =>
          response?._embedded &&
          response?._embedded[opts.halProperty || this._halProperty] &&
          Array.isArray(response._embedded[opts.halProperty || this._halProperty])
            ? response._embedded[opts.halProperty || this._halProperty]
            : []
        )
      );
  }

  protected getOne$(opts: { endpoint?: string; queryParams?: QueryParams } = {}): Observable<T> {
    return this.rest
      .get<HALResource<U>>({ url: this.url(opts.endpoint), queryParams: opts.queryParams, headers: this.headers() })
      .pipe(map((halResource) => this.serializerService.fromDto(halResource)));
  }

  getById$(id: number, opts: { queryParams?: QueryParams } = {}): Observable<T> {
    const queryParams: QueryParams = { sets: 'full', ...opts.queryParams };
    return this.getOne$({ endpoint: `${this._defaultEndpoint}/${id}`, queryParams });
  }

  protected postOne$(entity: T, opts: { queryParams?: QueryParams } = {}): Observable<T> {
    return this.rest
      .post<HALResource<U>>({
        url: this.url(),
        body: this.serializerService.toDto(entity),
        queryParams: opts.queryParams,
        headers: this.headers(),
      })
      .pipe(map((halResource) => this.serializerService.fromDto(halResource)));
  }

  protected putOne$(entity: T, id: number, opts: { queryParams?: QueryParams } = {}): Observable<T> {
    return this.rest
      .put<HALResource<U>>({
        url: `${this.url()}/${id}`,
        body: this.serializerService.toDto(entity),
        queryParams: opts.queryParams,
        headers: this.headers(),
      })
      .pipe(map((halResource) => this.serializerService.fromDto(halResource)));
  }

  protected deleteOne$(opts: { endpoint?: string; queryParams?: QueryParams } = {}): Observable<void> {
    return this.rest.delete<void>({
      url: this.url(opts.endpoint),
      queryParams: opts.queryParams,
      headers: this.headers(),
    });
  }

  protected deleteById$(id: number, opts: { queryParams?: QueryParams } = {}): Observable<void> {
    return this.deleteOne$({ endpoint: `${this._defaultEndpoint}/${id}`, queryParams: opts.queryParams });
  }

  protected request$<R = ResponseBody>(
    method: keyof RestService,
    endpoint: string,
    opts: { queryParams?: QueryParams; body?: unknown } = {}
  ): Observable<R> {
    const req: RestRequest = {
      url: this.url(endpoint),
      method,
      queryParams: opts.queryParams,
      body: opts.body,
      headers: this.headers(),
    };
    return this.rest.request<R>(req);
  }

  //
  // Private
  //

  private url(endpoint?: string): string {
    return `${environment.api.baseURL}${endpoint || this._defaultEndpoint}`;
  }

  private headers(): HttpHeaders {
    const headers: HttpHeaders = {
      Accept: 'application/hal+json',
    };

    return headers;
  }
}
