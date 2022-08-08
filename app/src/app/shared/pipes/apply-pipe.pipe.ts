/**
 * @file
 * A pipe to apply another pipe dynamically.
 *
 * The name of the pipe to apply, and its arguments if any,
 * are passed as arguments to this pipe.
 *
 * Example:
 *
 *   {{ myVar | applyPipe: columnDef.pipeName }}
 */
import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

import { AppInjector } from '@app/app-injector';
import { DashOnEmptyPipe } from './dash-on-empty.pipe';
import { PersonTypeToTranslatedLabelPipe } from './person-type-to-translated-label.pipe';

// List of supported dynamic pipes
const DYNAMIC_PIPES = {
  personTypeToTranslatedLabel: PersonTypeToTranslatedLabelPipe,
  date: DatePipe,
  dashOnEmpty: DashOnEmptyPipe,
};

@Pipe({
  name: 'applyPipe',
})
export class ApplyPipePipe implements PipeTransform {
  transform(value: any, pipeName: any, ...pipeArgs: any[]): unknown {
    const pipeService = this.getPipeService(pipeName);
    return pipeService.transform(value, pipeArgs);
  }

  private getPipeService(pipeName: keyof typeof DYNAMIC_PIPES): any {
    const injector = AppInjector.getInjector();
    return injector.get(DYNAMIC_PIPES[pipeName]);
  }
}
