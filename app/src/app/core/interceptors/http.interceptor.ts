import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TaskInterceptor implements HttpInterceptor {
  tasks: any[] = [];
  timerId: any;

  constructor(private ngxSpinnerService: NgxSpinnerService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        const now = new Date();
        if (!(event instanceof HttpResponse)) {
          this.tasks.push({ now, req });
          // The queue is no more empty, start the timer
          if (this.tasks.length === 1) {
            this.timerId = setTimeout(() => {
              // If the queue is still not empty, show the spinner
              this.ngxSpinnerService.show();
            }, 1000);
          }
        } else {
          this.tasks.shift();
          if (this.tasks.length === 0) {
            clearTimeout(this.timerId);
            this.ngxSpinnerService.hide();
          }
        }
        return event;
      }),
      catchError((error: HttpErrorResponse) => {
        clearTimeout(this.timerId);
        this.ngxSpinnerService.hide();
        this.tasks = [];
        return throwError(() => error);
      })
    );
  }
}
