import { Injectable } from '@angular/core';

import _ from 'lodash';
import { Observable, map } from 'rxjs';

import { HalApiService } from '@app/core/services/hal-api.service';
import { World } from '../models';

@Injectable({ providedIn: 'root' })
export class WorldService {
  constructor(private halApiService: HalApiService) {}

  getAll$(): Observable<World[]> {
    return this.halApiService
      .getCollection$(World, '/worlds', { sets: 'full' }, 'worlds')
      .pipe(map((worlds) => _.sortBy(worlds, 'order')));
  }
}
