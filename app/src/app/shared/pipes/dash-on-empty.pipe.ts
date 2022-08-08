import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dashOnEmpty',
})
export class DashOnEmptyPipe implements PipeTransform {
  transform(value: unknown): unknown | null {
    return !!value ? value : '-';
  }
}
