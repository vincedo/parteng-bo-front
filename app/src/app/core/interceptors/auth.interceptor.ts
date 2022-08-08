import { DOCUMENT } from '@angular/common';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpStatusCode,
} from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, EMPTY, map, Observable, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {
  disconnected = false;

  constructor(
    private router: Router,
    @Inject(DOCUMENT) private document: Document,
    private authService: AuthService,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Disconnected and not managing authentication requests, we cancel this request.
    if (this.disconnected && !req.url.includes('/authentication')) {
      return EMPTY;
    }
    // Common case
    const token = this.authService.getToken();
    // TODO: check if this ternary test is needed
    const request = !req.url.includes('/authentication')
      ? req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        })
      : req;
    return next.handle(request).pipe(
      map((event: HttpEvent<any>) => {
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === HttpStatusCode.Unauthorized) {
          // Token is invalid, we can remove it from localStorage.
          this.authService.deleteToken();
          if (!error?.error?.redirect) {
            // Token is invalid, we have to redirect to AD.
            this.disconnected = true;
            this.router.navigate(['/login']);
            return EMPTY;
          }
          // Backend gives us the login page url.
          this.document.location.href = error.error.redirect;
          return EMPTY;
        }
        return throwError(() => error);
      })
    );
  }
}
