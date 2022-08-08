/**
 * @file
 * A pipe to convert a person quality id into a user-friendly string.
 *
 * NB. This pipe requires the list of all person qualities to be cached in ConfigService.
 */
import { Pipe, PipeTransform } from '@angular/core';

import { ConfigService } from '@app/core/services';

@Pipe({
  name: 'personQuality',
})
export class PersonQualityPipe implements PipeTransform {
  constructor(private config: ConfigService) {}

  transform(personQualityId: number): string | null {
    const personQualities = this.config.getAllPersonQualities();
    const personQuality = personQualities.find((pQuality) => pQuality.id === personQualityId);
    return personQuality ? personQuality.name : null;
  }
}
