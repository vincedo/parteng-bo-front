/**
 * @file
 * A pipe to convert the person type into a translated string.
 */
import { Pipe, PipeTransform } from '@angular/core';

import { PERSON_TYPE } from '@app/project/models';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'personTypeToTranslatedLabel',
})
export class PersonTypeToTranslatedLabelPipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(value: PERSON_TYPE): string | null {
    if (value in PERSON_TYPE) {
      return this.translate.instant(`shared.personType.${value}`);
    }
    return null;
  }
}
