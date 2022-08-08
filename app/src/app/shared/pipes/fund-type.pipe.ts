/**
 * @file
 * A pipe to convert a fund type id into a string.
 *
 * NB. This pipe requires the list of all fund types to be cached in ConfigService.
 */
import { Pipe, PipeTransform } from '@angular/core';

import { ConfigService } from '@app/core/services';

@Pipe({
  name: 'fundType',
})
export class FundTypePipe implements PipeTransform {
  constructor(private config: ConfigService) {}

  transform(fundTypeId: number): string | null {
    const fundTypes = this.config.getAllFundTypes();
    const fundType = fundTypes.find((type) => type.id === fundTypeId);
    return fundType ? fundType.short_name : null;
  }
}
