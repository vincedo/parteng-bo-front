/**
 * @file
 * Abstract service describe how an entity can be serialized and deserialized.
 */
import { HALResource } from '../models';
import { Entity, EntityDto } from '../models/entity.model';

export abstract class SerializerService<ENTITY extends Entity, DTO extends EntityDto> {
  abstract fromDto(dto: HALResource<DTO>): ENTITY;

  abstract toDto(entity: ENTITY): DTO;

  protected getDtoBaseProps(entity: ENTITY) {
    return {
      // id: entity.id,
      status: entity.status,
      // created: entity.created,
      // updated: entity.updated,
    };
  }
}
