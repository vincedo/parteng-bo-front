import { Injectable } from '@angular/core';

import _ from 'lodash';
import { Observable, map } from 'rxjs';

import { HalApiService } from '@app/core/services/hal-api.service';
import { StandardFolder2 } from '../models';

@Injectable({ providedIn: 'root' })
export class StandardFolderService2 {
  constructor(private halApiService: HalApiService) {}

  getAll$(): Observable<StandardFolder2[]> {
    return this.halApiService
      .getCollection$(StandardFolder2, '/standard-folders', { sets: 'full' }, 'standard_folders')
      .pipe(map((standardFolders) => _.sortBy(standardFolders, 'order')));
  }
}
