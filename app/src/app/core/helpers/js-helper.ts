/**
 * @file
 * JavaScript Helper class.
 */

export class JsHelper {
  //
  // ----- Object -----
  //

  /**
   * Return true if the given object contains the given string.
   *
   * NB. This function is CASE INSENSITIVE (all strings are normalized).
   *
   * @param obj The object to search.
   * @param str The string to search for.
   * @param props The object props to search. If undefined, search all object props.
   */
  static ObjPropsContainString(obj: any, str: string, props?: string[]): boolean {
    props = props || Object.keys(obj);
    const values = props
      .map((prop) => obj[prop])
      .filter(Boolean)
      .map((val) => `${val}`);
    return values.some((value) => JsHelper.strContainsStr(value, str));
  }

  /**
   * Return the keys in the given object whose values are true.
   *
   * Useful when retrieving the value of a multi-checkbox field.
   */
  static objGetKeysTrue(obj: { [k: string]: boolean }): string[] {
    const keys: string[] = [];
    for (const k in obj) {
      if (obj[k] === true) {
        keys.push(k);
      }
    }
    return keys;
  }

  /**
   * Update the property at obj.keyAndIndex, where keyAndIndex
   * is in the format "propName.propIndex" e.g. "name.3".
   */
  static objUpdateIndexedProp<T extends { [k: string]: any }>(obj: T, keyAndIndex: string, value: any): T {
    const objCopy = JSON.parse(JSON.stringify(obj)); // in case `obj` comes from state and is immutable
    const propName = keyAndIndex.split('.')[0];
    const propIndex = Number(keyAndIndex.split('.')[1]);
    if (objCopy[propName] && Array.isArray(objCopy[propName])) {
      objCopy[propName][propIndex] = value;
    }
    return objCopy;
  }

  //
  // ----- Array -----
  //

  /**
   * Insert an item into an array at the given index
   * without mutating the original array.
   */
  static arrInsertAt<T>(arr: T[], item: T, index: number): T[] {
    return [...arr.slice(0, index), item, ...arr.slice(index)];
  }

  /**
   * Replace the item at the given index in the given array
   * without mutating the original array.
   */
  static arrReplaceAt<T>(arr: T[], item: T, index: number): T[] {
    return [...arr.slice(0, index), item, ...arr.slice(index + 1)];
  }

  static arrUnique<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
  }

  //
  // ----- String -----
  //

  // Test if str1 contains str2 after normalizing the two strings
  static strContainsStr(str1: string, str2: string): boolean {
    str1 = JsHelper.strNormalize(str1);
    str2 = JsHelper.strNormalize(str2);
    return str1.includes(str2);
  }

  /**
   * Normalize the given string by trimming it, lowercasing it,
   * optionally removing the accented characters, etc.
   */
  static strNormalize(
    str: string,
    opts: { trim?: boolean; lowercase?: boolean; removeAccents?: boolean } = {}
  ): string {
    const defaults = { trim: true, lowercase: true, removeAccents: true };
    const options = { ...defaults, ...opts };
    str = str.normalize('NFC');
    if (options.trim) {
      str = str.trim();
    }
    if (options.lowercase) {
      str = str.toLowerCase();
    }
    if (options.removeAccents) {
      str = JsHelper.strRemoveAccents(str);
    }
    return str;
  }

  /**
   * Remove accents in the given string by replacing them
   * with their non-accented counterpart, e.g. "é" ==> "e"
   *
   * @see https://gist.github.com/marcelo-ribeiro/abd651b889e4a20e0bab558a05d38d77
   */
  static strRemoveAccents(str: string): string {
    const accentsMap: Map<string, string> = new Map([
      ['A', 'Á|À|Ã|Â|Ä'],
      ['a', 'á|à|ã|â|ä'],
      ['E', 'É|È|Ê|Ë'],
      ['e', 'é|è|ê|ë'],
      ['I', 'Í|Ì|Î|Ï'],
      ['i', 'í|ì|î|ï'],
      ['O', 'Ó|Ò|Ô|Õ|Ö'],
      ['o', 'ó|ò|ô|õ|ö'],
      ['U', 'Ú|Ù|Û|Ü'],
      ['u', 'ú|ù|û|ü'],
      ['C', 'Ç'],
      ['c', 'ç'],
      ['N', 'Ñ'],
      ['n', 'ñ'],
    ]);

    const reducer = (acc: string, key: string) => acc.replace(new RegExp(accentsMap.get(key)!, 'g'), key);

    const f = Array.from(accentsMap.keys());
    return f.reduce(reducer, str);
  }

  //
  // ----- Date -----
  //

  /**
   * Convert the given date object to a YYYY-MM-DD string
   */
  static dateToYMD(dateObj: Date): string {
    const padNumber = (n: number) => (`${n}`.length === 1 ? `0${n}` : `${n}`);
    return `${dateObj.getFullYear()}-${padNumber(dateObj.getMonth() + 1)}-${padNumber(dateObj.getDate())}`;
  }
}
