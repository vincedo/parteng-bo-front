import { Injectable } from '@angular/core';
import { HalApiService } from '@app/core/services/hal-api.service';
import { Observable } from 'rxjs';
import { DataType, ValueType } from '../models/value-type.model';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class ValueTypeService {
  constructor(private halApiService: HalApiService, private settingsService: SettingsService) {}

  getAll$(): Observable<ValueType[]> {
    return this.halApiService.getCollection$(ValueType, `/value-types`, {}, 'value_types');
  }

  getDataTypeId(dataType: DataType): number {
    return this.settingsService.get<number>(dataType)!;
  }

  getDataTypeDefaultValue(dataType: number): string | number | boolean | undefined {
    return (
      {
        [this.settingsService.get<number>('DATA_TYPE_TEXT') as number]: '',
        [this.settingsService.get<number>('DATA_TYPE_ADDRESS') as number]: null,
        [this.settingsService.get<number>('DATA_TYPE_BOOLEAN') as number]: 0,
        [this.settingsService.get<number>('DATA_TYPE_CONTRACT_EVENT') as number]: null,
        [this.settingsService.get<number>('DATA_TYPE_DATE') as number]: null,
        [this.settingsService.get<number>('DATA_TYPE_FLOAT') as number]: 0,
        [this.settingsService.get<number>('DATA_TYPE_INSTRUMENT') as number]: null,
        [this.settingsService.get<number>('DATA_TYPE_INT') as number]: 0,
        [this.settingsService.get<number>('DATA_TYPE_PERSON') as number]: null,
        [this.settingsService.get<number>('DATA_TYPE_REPAYMENT_TYPE') as number]: null,
      }[dataType] || undefined
    );
  }
}
