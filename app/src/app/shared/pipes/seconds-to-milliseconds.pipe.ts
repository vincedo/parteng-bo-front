/**
 * @file
 * A pipe to convert seconds to milliseconds (x 1000).
 * Used to convert Unix timestamps into JS timestamps.
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsToMilliseconds',
})
export class SecondsToMillisecondsPipe implements PipeTransform {
  transform(value: number): number | null {
    if (value) {
      return value * 1000;
    }
    return null;
  }
}
