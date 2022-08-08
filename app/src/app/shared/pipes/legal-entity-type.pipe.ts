/**
 * @file
 * A pipe to convert a legal entity type id into a string.
 *
 * NB. This pipe requires the list of all legal entity types to be cached in ConfigService.
 */
import { Pipe, PipeTransform } from '@angular/core';

import { ConfigService } from '@app/core/services';

@Pipe({
  name: 'legalEntityType',
})
export class LegalEntityTypePipe implements PipeTransform {
  constructor(private config: ConfigService) {}

  transform(legalEntityTypeId: number): string | null {
    const legalEntityTypes = this.config.getAllLegalEntityTypes();
    const legalEntityType = legalEntityTypes.find((type) => type.id === legalEntityTypeId);
    return legalEntityType ? legalEntityType.short_name : null;
  }
}
