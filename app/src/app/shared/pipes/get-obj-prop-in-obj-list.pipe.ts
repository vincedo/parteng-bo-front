/**
 * @file
 * A pipe to find an object in a list of objects by its id
 * and then return a specific prop of that object
 */
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'getObjPropInObjList',
})
export class GetObjPropInObjListPipe implements PipeTransform {
  transform(id: number, propName: string, objects: { id: number; [k: string]: any }[]): string | null {
    if (id && Array.isArray(objects)) {
      const obj = objects.find((obj) => obj.id === id);
      return obj ? `${obj[propName]}` : ``;
    }
    return null;
  }
}
