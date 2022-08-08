import { Injectable } from '@angular/core';
import { HalApiService } from '@app/core/services/hal-api.service';
import { Person } from '@app/project/models';
import { Observable } from 'rxjs';
import { AttributeType } from '../models/attribute-type.model';
import { Attribute } from '../models/attribute.model';
import { InstrumentVersion } from '../models/instrument-version.model';
import { Instrument2 } from '../models/instrument.model';
import { RepaymentType } from '../models/repayment-type.model';
import { DataType } from '../models/value-type.model';
import { SettingsService } from './settings.service';
import { ValueTypeService } from './value-type.service';

@Injectable({ providedIn: 'root' })
export class AttributeService {
  constructor(
    private halApiService: HalApiService,
    private settingsService: SettingsService,
    private valueTypeService: ValueTypeService
  ) {}

  newAttribute(
    attributeType: AttributeType,
    instrumentVersion?: InstrumentVersion,
    value?: string | number | boolean | RepaymentType | Person | Instrument2,
    id?: number
  ): Attribute {
    const attribute = new Attribute();
    attribute.id = id;
    attribute.status = this.settingsService.get<number>('STATUS_ACTIVE')!;
    attribute.attributeTypeId = attributeType.id;
    attribute.attributeType = attributeType;
    attribute.instrumentVersionId = instrumentVersion?.id || 0;
    if (value !== undefined) {
      const setters: { [key: number]: (a: Attribute, v: any) => any } = {
        [this.valueTypeService.getDataTypeId(DataType.TEXT)]: (a: Attribute, v: string) => (a.scalarValue = v),
        [this.valueTypeService.getDataTypeId(DataType.INT)]: (a: Attribute, v: number) => (a.scalarValue = v),
        [this.valueTypeService.getDataTypeId(DataType.FLOAT)]: (a: Attribute, v: number) => (a.scalarValue = v),
        [this.valueTypeService.getDataTypeId(DataType.DATE)]: (a: Attribute, v: number) => (a.scalarValue = v),
        [this.valueTypeService.getDataTypeId(DataType.BOOLEAN)]: (a: Attribute, v: boolean) =>
          (a.scalarValue = !!v ? 1 : 0),
        [this.valueTypeService.getDataTypeId(DataType.PERSON)]: (a: Attribute, v: Person) => (a.personId = v.id),
        [this.valueTypeService.getDataTypeId(DataType.INSTRUMENT)]: (a: Attribute, v: Instrument2) =>
          (a.instrumentId = v.id),
        [this.valueTypeService.getDataTypeId(DataType.REPAYMENT_TYPE)]: (a: Attribute, v: RepaymentType) =>
          (a.repaymentTypeId = v.id),
        [this.valueTypeService.getDataTypeId(DataType.CONTRACT_EVENT)]: (a: Attribute, v: RepaymentType) => undefined,
      };
      setters[attributeType.valueType.dataType](attribute, value);
    }
    return attribute;
  }

  saveAttribute(attribute: Attribute): Observable<Attribute> {
    return this.halApiService.postOne$<Attribute>('/attributes', {}, attribute);
  }

  updateAttribute(attribute: Attribute): Observable<Attribute> {
    return this.halApiService.putOne$<Attribute>(`/attributes/${attribute.id}`, {}, attribute);
  }
}
