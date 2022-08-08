import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DateService {
  now(): number {
    return Date.now();
  }
}
