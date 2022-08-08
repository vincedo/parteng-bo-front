import { ENTITY_STATUS, ENTITY_STATUS_DEFAULT } from './entity-status.enum';

//
// ----- DTOs -----
//

export interface EntityDto {
  status: ENTITY_STATUS;
  created: number;
  updated: number;
}

export interface EntityWithIdDto extends EntityDto {
  id: number;
}

//
// ----- Frontend Models -----
//

export abstract class Entity {
  status!: ENTITY_STATUS;
  created!: number;
  updated!: number;

  constructor(opts: Partial<EntityDto> = {}) {
    this.status = opts.status !== undefined ? opts.status : ENTITY_STATUS_DEFAULT;
    if (opts.created) {
      this.created = opts.created;
    }
    if (opts.updated) {
      this.updated = opts.updated;
    }
  }

  protected cloneEntityProps(opts: Partial<EntityDto> = {}): EntityDto {
    return {
      status: opts.status !== undefined ? opts.status : this.status,
      created: opts.created || this.created,
      updated: opts.updated || this.updated,
    };
  }

  // // ---------- Override this in child class
  // static fromJson(json: any): AbstractEntity {
  //   throw new Error('Not overridden');
  // }

  // // Return API-friendly JSON
  // // Does not include system props like `id`, `created`...
  // toApiJson(): { [k: string]: any } {
  //   return {
  //     status: this.status,
  //     ...this.getPropsAsApiJson(),
  //   };
  // }

  // protected abstract getPropsAsApiJson(): { [k: string]: any };

  // // Return a full JSON representation of the entity
  // toJson(): { [k: string]: any } {
  //   return {
  //     status: this.status,
  //     ...this.getPropsAsJson(),
  //   };
  // }

  // getPropsAsJson(): { [k: string]: any } {
  //   return this.getPropsAsApiJson();
  // }
}

export abstract class EntityWithId extends Entity {
  id!: number;

  constructor(opts: Partial<EntityWithIdDto> = {}) {
    super(opts);
    if (opts.id) {
      this.id = opts.id;
    }
  }

  protected override cloneEntityProps(opts: Partial<EntityWithIdDto> = {}): EntityWithIdDto {
    return {
      ...super.cloneEntityProps(opts),
      id: opts.id !== undefined ? opts.id : this.id, // this value could be reset with a "null"
    };
  }
}
