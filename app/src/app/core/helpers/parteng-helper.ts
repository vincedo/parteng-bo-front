/**
 * @file
 * Parteng-specific Helper class.
 */
import { HttpErrorResponse } from '@angular/common/http';

import { PartengHttpError } from '../models/parteng-http-error.model';
import { IdToIdRel } from '../models/id-to-id-rel.model';

export class PartengHelper {
  static getEnvNameFromHostName(hostName: string): string {
    const matches = hostName.match(/([a-z-]*)\.arpilabe\.com/);
    const subDomain = matches ? matches[1] : '';

    if (subDomain === 'parteng') {
      return 'Production';
    } else if (subDomain === 'parteng-uat') {
      return 'UAT';
    } else if (subDomain === 'parteng-dev' || hostName === 'localhost') {
      return 'Développement';
    } else {
      return 'Env inconnu';
    }
  }

  static formatHttpError(error: HttpErrorResponse | Error): string {
    if (error instanceof HttpErrorResponse) {
      const partengHttpError = error.error as PartengHttpError;
      let errorMsg = partengHttpError.detail;
      switch (error.status) {
        // Conflict
        case 409:
          return `${errorMsg} (${partengHttpError.errors['name']})`;
        // Forbidden
        case 403:
          const propertiesInError = Object.keys(partengHttpError.errors).join(', ');
          return `${errorMsg} (error caused by these properties: ${propertiesInError})`;
        default:
          return errorMsg;
      }
    }
    // Non-HTTP error
    else {
      return `${error.name}: ${error.message}`;
    }
  }

  static computeIdToIdRelationsDiff(rels1: IdToIdRel[], rels2: IdToIdRel[]) {
    const serializeRel = (rel: IdToIdRel) => `${rel[0]}_${rel[1]}`;
    const deserializeRel = (relStr: string) => relStr.split('_').map((str) => Number(str)) as IdToIdRel;
    const rels1Str = rels1.map((rel) => serializeRel(rel));
    const rels2Str = rels2.map((rel) => serializeRel(rel));

    const createdRelsStr = rels2Str.filter((relStr) => !rels1Str.includes(relStr));
    const updatedRelsStr = rels2Str.filter((relStr) => rels1Str.includes(relStr));
    const deletedRelsStr = rels1Str.filter((relStr) => !rels2Str.includes(relStr));

    const created = createdRelsStr.map((relStr) => deserializeRel(relStr));
    const updated = updatedRelsStr.map((relStr) => deserializeRel(relStr));
    const deleted = deletedRelsStr.map((relStr) => deserializeRel(relStr));

    return { created, updated, deleted };
  }

  /**
   * A split point is a string of the form "n/m" where m is the total number of columns
   * and n is the number of columns for the first column.
   *
   * Useful to create a CSS grid dynamically.
   *
   * @param splitPoint Examples: "1/2", "4/6"
   */
  static processColumnsSplitPoint(splitPoint: string):
    | {
        col1: number;
        col2: number;
        totalCols: number;
      }
    | undefined {
    const splitPointParts = splitPoint.split('/');
    if (splitPointParts.length === 2) {
      const col1 = parseInt(splitPointParts[0], 10);
      const totalCols = parseInt(splitPointParts[1], 10);
      const col2 = totalCols - col1;
      return { col1, col2, totalCols };
    }
    return;
  }
}
