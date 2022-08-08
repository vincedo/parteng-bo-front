import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { QueryParams } from '../models/rest.models';
import { Constructor, HALCollection, HALResource, HALSerializerService } from './hal-serializer.service';
import { RestService } from './rest.service';

@Injectable({ providedIn: 'root' })
export class HalApiService {
  constructor(private serializerService: HALSerializerService, private restService: RestService) {}

  getCollection$<T>(
    ctor: Constructor<T>,
    endpoint: string,
    queryParams: QueryParams,
    embeddedKey: string
  ): Observable<any> {
    return this.restService
      .get<HALCollection>({ method: 'get', url: `${environment.api.baseURL}${endpoint}`, queryParams })
      .pipe(
        map((response: HALCollection) => {
          return response &&
            response._embedded &&
            response._embedded[embeddedKey] &&
            Array.isArray(response._embedded[embeddedKey])
            ? response._embedded[embeddedKey]
            : [];
        }),
        map((collection: HALResource[]) =>
          collection.map((entity) => this.serializerService.deserialize<T>(entity, ctor))
        )
      );
  }

  getOne$<T>(ctor: Constructor<T>, endpoint: string, queryParams: QueryParams): Observable<T> {
    return this.restService
      .get<HALResource>({ method: 'get', url: `${environment.api.baseURL}${endpoint}`, queryParams })
      .pipe(map((entity: HALResource) => this.serializerService.deserialize<T>(entity, ctor)));
  }

  postOne$<T>(endpoint: string, queryParams: QueryParams, body?: unknown): Observable<any> {
    return this.restService.post({
      method: 'post',
      url: `${environment.api.baseURL}${endpoint}`,
      body: this.serializerService.serialize(body),
      queryParams,
    });
  }

  putOne$<T>(endpoint: string, queryParams: QueryParams, body?: unknown): Observable<any> {
    return this.restService.put({
      method: 'put',
      url: `${environment.api.baseURL}${endpoint}`,
      body: this.serializerService.serialize(body),
      queryParams,
    });
  }

  deleteOne$<T>(endpoint: string, queryParams: QueryParams = {}): Observable<any> {
    return this.restService.delete({
      method: 'delete',
      url: `${environment.api.baseURL}${endpoint}`,
      queryParams,
    });
  }
}
