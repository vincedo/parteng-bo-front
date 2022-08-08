/**
 * @file
 * Interface describing a table column to use in an Angular Material Table.
 *
 * @see https://material.angular.io/components/table
 */
export interface TableColumnDef {
  key: string;
  labelTranslateKey: string;
  pipeName?: string;
  pipeArgs?: any[];
}
