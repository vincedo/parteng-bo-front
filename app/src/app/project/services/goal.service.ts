import { Injectable } from '@angular/core';

import _ from 'lodash';
import { Observable, map } from 'rxjs';

import { HalApiService } from '@app/core/services/hal-api.service';
import { Goal } from '../models';

@Injectable({ providedIn: 'root' })
export class GoalService {
  constructor(private halApiService: HalApiService) {}

  getAll$(): Observable<Goal[]> {
    return this.halApiService
      .getCollection$(Goal, '/goals', { sets: 'full' }, 'goals')
      .pipe(map((scopes) => _.sortBy(scopes, 'order')));
  }
}
