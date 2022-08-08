import { HALDeserializeFrom, HALOptional, HALSerializeTo } from '@app/core/services/hal-serializer.service';
import { EntityWithId, EntityWithIdDto } from '@app/shared/models';
import { InstrumentType } from './instrument-type.model';
import { InstrumentVersion } from './instrument-version.model';

export interface InstrumentDto extends EntityWithIdDto {
  name: string;
  effective_date: string;
  instrument_type_id: number;
  comment: string;
}

interface InstrumentDtoAndRels extends InstrumentDto {
  // @TODO: Finish this
}

export class Instrument extends EntityWithId {
  name: string;
  effective_date: string;
  instrument_types_id: number;
  comment: string | undefined;

  constructor(opts: Partial<InstrumentDtoAndRels> = {}) {
    super(opts);
    this.name = opts.name!;
    this.effective_date = opts.effective_date!;
    this.instrument_types_id = opts.instrument_type_id!;
    this.comment = opts.comment;
  }

  clone(opts: Partial<InstrumentDtoAndRels> = {}) {
    return new Instrument({
      ...this.cloneEntityProps(opts),
      name: opts.name || this.name,
      effective_date: opts.effective_date,
      instrument_type_id: opts.instrument_type_id || this.instrument_types_id,
      comment: opts.comment || this.comment,
    });
  }
}

export class Instrument2 extends EntityWithId {
  @HALDeserializeFrom()
  @HALSerializeTo()
  override status: number = 0;

  @HALDeserializeFrom()
  override id: number = 0;

  @HALDeserializeFrom()
  name: string = '';

  @HALDeserializeFrom('instrument_types_id')
  @HALSerializeTo('instrument_types_id')
  instrumentTypeId: number = 0;

  @HALDeserializeFrom('instrument_versions', InstrumentVersion)
  @HALSerializeTo('instrument_versions')
  instrumentVersions?: InstrumentVersion[] = [];

  @HALDeserializeFrom('instrument_type')
  @HALOptional()
  instrumentType?: InstrumentType;

  @HALDeserializeFrom()
  @HALSerializeTo()
  comment: string = '';
}
