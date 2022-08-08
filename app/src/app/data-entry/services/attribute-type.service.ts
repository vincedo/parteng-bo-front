import { Injectable } from '@angular/core';
import { HalApiService } from '@app/core/services/hal-api.service';
import { HALDeserializeFrom } from '@app/core/services/hal-serializer.service';
import { map, Observable, tap } from 'rxjs';
import { AttributeType } from '../models/attribute-type.model';
class RelInstrumentTypesToAttributeTypes {
  @HALDeserializeFrom('attribute_types_id')
  attributeTypeId: number = 0;

  @HALDeserializeFrom('instrument_types_id')
  instrumentTypeId: number = 0;

  @HALDeserializeFrom()
  order: number = 0;

  @HALDeserializeFrom()
  nullable: number = 0;

  @HALDeserializeFrom('attribute_type')
  attributeType!: AttributeType;

  @HALDeserializeFrom('input_instructions')
  inputInstructions: string = '';

  @HALDeserializeFrom()
  modifiable: boolean = false;
}

@Injectable({ providedIn: 'root' })
export class AttributeTypeService {
  constructor(private halApiService: HalApiService) {}

  getAll$(): Observable<AttributeType[]> {
    return this.halApiService.getCollection$(AttributeType, `/attribute-types`, {}, 'attribute_types');
  }

  getByInstrumentType$(instrumentTypeId: number): Observable<AttributeType[]> {
    return this.halApiService
      .getCollection$(
        RelInstrumentTypesToAttributeTypes,
        `/instrument-types/${instrumentTypeId}/attribute-types`,
        { sets: 'full' },
        'rel_instrument_types_to_attribute_types'
      )
      .pipe(
        map((relations: RelInstrumentTypesToAttributeTypes[]) =>
          relations.map(
            (relation): AttributeType => ({
              ...relation.attributeType,
              order: relation.order,
              nullable: !!relation.nullable,
              inputInstructions: relation.inputInstructions,
              modifiable: relation.modifiable,
            })
          )
        )
      );
  }
}
