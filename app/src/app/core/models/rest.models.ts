import { HttpErrorResponse } from '@angular/common/http';
import { Constructor } from '../services/hal-serializer.service';
import { RestService } from '../services/rest.service';

export interface HttpHeaders {
  [key: string]: string;
}

export interface QueryParams {
  // string | string[] is the accepted parameter type by Angular's HttpClient
  [key: string]: string | string[];
}

export type RestMethod = keyof RestService;

export interface RestRequest {
  url: string;
  method?: RestMethod;
  queryParams?: QueryParams;
  body?: unknown;
  headers?: HttpHeaders;
}

export interface HALRestRequest<T = unknown> {
  endpoint: string;
  method: RestMethod;
  queryParams?: QueryParams;
  body: T;
  headers?: HttpHeaders;
  ctor: Constructor<T>;
  stateSliceKey?: string;
}

export interface RestError {
  request: RestRequest;
  error: HttpErrorResponse;
}
