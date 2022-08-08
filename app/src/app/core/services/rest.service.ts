/**
 * @file
 * Thin wrapper around Angular's HttpClient.
 */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RestRequest } from '../models/rest.models';

export type ResponseBody = unknown;

@Injectable({ providedIn: 'root' })
export class RestService {
  constructor(private http: HttpClient) {}

  get<T = ResponseBody>(request: RestRequest): Observable<T> {
    const httpOptions = {
      headers: new HttpHeaders(request.headers),
      params: request.queryParams,
    };
    return this.http.get<T>(request.url, httpOptions);
  }

  post<T = ResponseBody>(request: RestRequest): Observable<T> {
    const httpOptions = {
      headers: new HttpHeaders(request.headers),
      params: request.queryParams,
    };
    return this.http.post<T>(request.url, request.body, httpOptions);
  }

  put<T = ResponseBody>(request: RestRequest): Observable<T> {
    const httpOptions = {
      headers: new HttpHeaders(request.headers),
      params: request.queryParams,
    };
    return this.http.put<T>(request.url, request.body, httpOptions);
  }

  delete<T = ResponseBody>(request: RestRequest): Observable<T> {
    const httpOptions = {
      headers: new HttpHeaders(request.headers),
      params: request.queryParams,
    };
    return this.http.delete<T>(request.url, httpOptions);
  }

  request<G = ResponseBody>(req: RestRequest): Observable<G> {
    const httpOptions = {
      headers: new HttpHeaders(req.headers),
      params: req.queryParams,
      body: req.body,
    };
    return this.http.request<G>(req.method!, req.url, httpOptions);
  }
}
