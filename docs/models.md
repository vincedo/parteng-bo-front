# Parteng Models

## General Guidelines

For each application model, 4 elements need to be implemented :

- `ModelDto` — The raw JSON received from backend. Extends `EntityWithIdDto` or `EntityDto`.
- `Model` — The frontend model class. Extends `EntityWithId` or `Entity`.
- `ModelService` — A service for CRUD operations on the model. Extends `PartengApiService`.
- `ModelSerializerService` — A service for CRUD operations on the model. Extends `SerializerService<Model, ModelDto>`.

## Example Model

Note how related entities are NOT included in the DTO.

```typescript
export interface CarDto extends EntityWithIdDto {
  name: string;
  year: number;
}

export class Car extends EntityWithId {
  name: string; // required
  year: number | undefined; // optional

  // Related entities
  drivers: Driver[];

  constructor(opts: Partial<CarDto> = {}, rel: { drivers?: Driver[] } = {}) {
    super(opts);
    this.name = opts.name!;
    this.year = opts.year!;
    this.drivers = rel.drivers || [];
  }

  clone(opts: Partial<CarDto> & { drivers?: Driver[] } = {}): Folder {
    const clone = new Car({
      // sys props
      id: this.id,
      status: this.status,
      created: this.created,
      updated: this.updated,
      // entity props
      name: opts.name || this.name,
      year: opts.year !== undefined ? opts.year : this.year,
    });
    clone.drivers = opts.drivers || [...this.drivers];
    return clone;
  }
}
```
