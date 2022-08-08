import { Injectable } from '@angular/core';
import { HalApiService } from '@app/core/services/hal-api.service';
import { Observable } from 'rxjs';
import { RepaymentType } from '../models/repayment-type.model';

@Injectable({ providedIn: 'root' })
export class RepaymentTypeService {
  constructor(private halApiService: HalApiService) {}

  getAll$(): Observable<RepaymentType[]> {
    return this.halApiService.getCollection$<RepaymentType>(RepaymentType, '/repayment-types', {}, 'repayment_types');
  }
}
