/**
 * @file
 * TEMPORARY model for Instrument.
 *
 * @todo
 * replace with Antoine's full-blown model
 */
import { EntityWithId, EntityWithIdDto } from '@app/shared/models';

export interface InstrumentLightDto extends EntityWithIdDto {
  instrument_types_id: number;
  name: string;
  comment: string;
}

export class InstrumentLight extends EntityWithId {
  instrument_types_id: number;
  name: string;
  comment: string | undefined;

  constructor(opts: Partial<InstrumentLightDto> = {}) {
    super(opts);

    this.instrument_types_id = opts.instrument_types_id!;
    this.name = opts.name!;
    this.comment = opts.comment;
  }
}
