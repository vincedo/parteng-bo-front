import { Injectable } from '@angular/core';
import 'reflect-metadata';

const METADATA_KEY = 'HALMappings';
interface Mapping<U = { [key: string]: unknown }, T = unknown> {
  deserialize: {
    halKey: string;
    propertyKey: keyof U;
    propertyType: unknown;
    arrayItemsType: Constructor<T> | undefined;
    optional: boolean;
  };
  serialize: {
    propertyKey: keyof U;
    serializeTo: string;
  };
  deserializeNullTo: {
    // Why this property ?
    // Because we might want to deserialize null to undefined.
    active: boolean;
    value: unknown;
  };
  serializeUndefinedTo: {
    active: boolean;
    value: unknown;
  };
  serializeValueToNewValue: {
    active: boolean;
    value: unknown;
    newValue: unknown;
  };
  isDate: boolean;
}

interface Mappings<U, T> {
  [key: string]: Mapping<U, T>;
}

// This type defines a contract telling us:
// you will be able to instantiate a class T.
// This avoids invalid typing with object literals.
export type Constructor<T> = new () => T;

// TODO: check if T,U is really necessary (unused when declaring)
export const HALDeserializeFrom =
  <U, T>(halKey?: string, arrayItemsType?: Constructor<T>) =>
  (target: U, propertyKey: string) => {
    const propertyType: unknown = Reflect.getMetadata('design:type', target, propertyKey);
    if (propertyType === undefined) {
      const targetName = (target as unknown as Constructor<U>).constructor.name;
      throw new Error(
        `HALDeserializeFrom decorator on ${targetName}.${propertyKey}: could not find property type. Did you add emitDecoratorMetadata to yout tsconfig.json?`
      );
    }
    if (propertyType === Array && arrayItemsType === undefined) {
      throw new Error(
        `HALDeserializeFrom decorator on ${target}.${propertyKey}: this is an array, but array items type (2nd argument) is missing`
      );
    }
    const mappings: Mappings<U, T> = Reflect.getMetadata(METADATA_KEY, target) || ({} as Mappings<U, T>);
    const mapping: Mapping<U, T> = mappings[propertyKey];
    mappings[propertyKey] = {
      ...mapping,
      deserialize: {
        ...mappings[propertyKey]?.deserialize,
        halKey: halKey || propertyKey,
        propertyKey: propertyKey as keyof U,
        propertyType,
        arrayItemsType,
        // Ensure that default value is explicitly false
        optional: !!mappings[propertyKey]?.deserialize?.optional ? true : false,
      },
    };
    Reflect.defineMetadata(METADATA_KEY, mappings, target);
  };

export const HALOptional =
  <U, T>() =>
  (target: U, propertyKey: string) => {
    const mappings: Mappings<U, T> = Reflect.getMetadata(METADATA_KEY, target) || ({} as Mappings<U, T>);
    const mapping: Mapping<U, T> = mappings[propertyKey];
    mappings[propertyKey] = {
      ...mapping,
      deserialize: {
        ...mappings[propertyKey]?.deserialize,
        optional: true,
      },
    };
    Reflect.defineMetadata(METADATA_KEY, mappings, target);
  };

export const HALDate =
  <U, T>() =>
  (target: U, propertyKey: string) => {
    const mappings: Mappings<U, T> = Reflect.getMetadata(METADATA_KEY, target) || ({} as Mappings<U, T>);
    const mapping: Mapping<U, T> = mappings[propertyKey];
    mappings[propertyKey] = {
      ...mapping,
      isDate: true,
    };
    Reflect.defineMetadata(METADATA_KEY, mappings, target);
  };

export const HALDeserializeNullTo =
  <U, T>(value: unknown) =>
  (target: U, propertyKey: string) => {
    const mappings: Mappings<U, T> = Reflect.getMetadata(METADATA_KEY, target) || ({} as Mappings<U, T>);
    const mapping: Mapping<U, T> = mappings[propertyKey];
    mappings[propertyKey] = {
      ...mapping,
      deserializeNullTo: {
        active: true,
        value,
      },
    };
    Reflect.defineMetadata(METADATA_KEY, mappings, target);
  };

export const HALSerializeTo =
  <U, T>(halKey?: string) =>
  (target: U, propertyKey: string) => {
    const propertyType: unknown = Reflect.getMetadata('design:type', target, propertyKey);
    if (propertyType === undefined) {
      throw new Error(
        `HALSerializeTo decorator on ${target}.${propertyKey}: could not find property type. Did you add emitDecoratorMetadata to yout tsconfig.json?`
      );
    }
    const mappings: Mappings<U, T> = Reflect.getMetadata(METADATA_KEY, target) || ({} as Mappings<U, T>);
    const mapping: Mapping<U, T> = mappings[propertyKey];
    mappings[propertyKey] = {
      ...mapping,
      serialize: {
        propertyKey: propertyKey as keyof U,
        serializeTo: halKey || propertyKey,
      },
    };
    Reflect.defineMetadata(METADATA_KEY, mappings, target);
  };

export const HALSerializeUndefinedTo =
  <U, T>(value: unknown) =>
  (target: U, propertyKey: string) => {
    const propertyType: unknown = Reflect.getMetadata('design:type', target, propertyKey);
    if (propertyType === undefined) {
      throw new Error(
        `HALSerializeUndefinedTo decorator on ${target}.${propertyKey}: could not find property type. Did you add emitDecoratorMetadata to yout tsconfig.json?`
      );
    }
    const mappings: Mappings<U, T> = Reflect.getMetadata(METADATA_KEY, target) || ({} as Mappings<U, T>);
    const mapping: Mapping<U, T> = mappings[propertyKey];
    mappings[propertyKey] = {
      ...mapping,
      serializeUndefinedTo: {
        active: true,
        value,
      },
    };
    Reflect.defineMetadata(METADATA_KEY, mappings, target);
  };

export const HALSerializeValueToNewValue =
  <U, T>(value: unknown, newValue: unknown) =>
  (target: U, propertyKey: string) => {
    const propertyType: unknown = Reflect.getMetadata('design:type', target, propertyKey);
    if (propertyType === undefined) {
      throw new Error(
        `HALSerializeUndefinedTo decorator on ${target}.${propertyKey}: could not find property type. Did you add emitDecoratorMetadata to yout tsconfig.json?`
      );
    }
    const mappings: Mappings<U, T> = Reflect.getMetadata(METADATA_KEY, target) || ({} as Mappings<U, T>);
    const mapping: Mapping<U, T> = mappings[propertyKey];
    mappings[propertyKey] = {
      ...mapping,
      serializeValueToNewValue: {
        active: true,
        value,
        newValue,
      },
    };
    Reflect.defineMetadata(METADATA_KEY, mappings, target);
  };

interface HALEmbedded {
  [key: string]: unknown;
}

// TODO: https://github.com/evert/hal-types/blob/master/src/index.ts
export interface HALResource {
  [key: string]: unknown;
  _links: {
    self: {
      href: string;
    };
  };
  _embedded?: HALEmbedded;
}

export interface HALCollection {
  _total_items: number;
  _embedded: {
    [key: string]: HALResource[];
  };
}

@Injectable({ providedIn: 'root' })
export class HALSerializerService {
  deserialize<T>(hal: HALResource, ctor: Constructor<T>) {
    const entity: T = new ctor();
    const mappings: Mappings<T, any> = Reflect.getMetadata(METADATA_KEY, entity);
    if (!mappings) {
      throw new Error(`HALSerializerService.deserialize(): could not find mappings on ${ctor.name}`);
    }
    Object.keys(mappings).forEach((propertyKey: string) => {
      const dezerializeConfig = mappings[propertyKey].deserialize;
      if (!dezerializeConfig) {
        return;
      }
      const halKey = dezerializeConfig.halKey;
      const entityProp: keyof T = dezerializeConfig.propertyKey;
      const entityPropType = dezerializeConfig.propertyType;
      const deserializeNullTo = mappings[propertyKey].deserializeNullTo;
      const isDate = mappings[propertyKey].isDate;

      let value = hal[halKey];
      if (value === null && deserializeNullTo && deserializeNullTo.active) {
        value = deserializeNullTo.value;
      }
      if (value !== undefined) {
        if (isDate) {
          // TODO: manage errors and/or date format.
          const [year, month, day] = ((value as string) || '').split('-').map((v) => parseInt(v, 10));
          value = new Date(year, month - 1, day);
        }
        entity[entityProp] = value as any;
        return;
      }
      if (hal._embedded === undefined) {
        return;
      }
      value = hal._embedded[halKey];
      if (value instanceof Array) {
        const arrayItemsType = dezerializeConfig.arrayItemsType;
        value = (value as Array<HALResource>).map((item) => this.deserialize(item, arrayItemsType!));
      }
      // Not an array. Object ?
      if (!isDate && typeof value === 'object' && !(value instanceof Array)) {
        value = this.deserialize(value as HALResource, entityPropType as Constructor<any>);
      }
      if (value === undefined && !dezerializeConfig.optional) {
        console.warn(`${ctor.name}, HAL property ${halKey} not found in _embedded, for ${entityProp} in hal ${hal}`);
      }
      entity[entityProp] = value as any;
    });
    return entity;
  }

  serialize<T = any>(entity: T): { [key: string]: unknown } {
    const mappings: Mappings<T, unknown> = Reflect.getMetadata(METADATA_KEY, entity);
    if (!mappings) {
      throw new Error(
        `HALSerializerService.serialize(): could not find mappings on ${
          (entity as unknown as Constructor<T>).constructor.name
        }`
      );
    }
    let hal: { [key: string]: unknown } = {};
    let embeddeds: { [key: string]: unknown } = {};
    Object.keys(mappings).forEach((propertyKey: string) => {
      const serializeConfig = mappings[propertyKey].serialize;
      if (!serializeConfig) {
        return;
      }
      const serializeTo = serializeConfig.serializeTo;
      const serializeUndefinedTo = mappings[propertyKey].serializeUndefinedTo;
      const serializeValueToNewValue = mappings[propertyKey].serializeValueToNewValue;
      const entityProp: keyof Constructor<T> = serializeConfig.propertyKey as keyof Constructor<T>;
      const isDate = mappings[propertyKey].isDate;
      // Note: by applying serizalingUndefinedTo first, we can serialize undefined to a specific array or object.
      let value =
        serializeUndefinedTo && serializeUndefinedTo.active ? serializeUndefinedTo.value : (entity[entityProp] as any);

      value =
        serializeValueToNewValue && serializeValueToNewValue.active && value === serializeValueToNewValue.value
          ? serializeValueToNewValue.newValue
          : value;
      // Array values are embedded
      if (value instanceof Array) {
        embeddeds[serializeTo] = value.map((item) => this.serialize(item));
        return;
      }
      // Date
      if (isDate) {
        const padNumber = (n: number) => (`${n}`.length === 1 ? `0${n}` : `${n}`);
        value = `${value.getFullYear()}-${padNumber(value.getMonth() + 1)}-${padNumber(value.getDate())}`;
      }
      if (!isDate && typeof value === 'object' && !(value instanceof Array)) {
        // Object value
        embeddeds[serializeTo] = !!value ? this.serialize(value) : value;
        return;
      }
      // Scalar value
      hal[serializeTo] = value;
    });
    if (Object.keys(embeddeds).length > 0) {
      hal['_embedded'] = embeddeds;
    }
    return hal;
  }
}
