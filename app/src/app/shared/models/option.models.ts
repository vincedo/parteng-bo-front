/**
 * @file
 * Interfaces to model a list of options, i.e. in a select, radio-group or checkbox-group.
 */
export interface Option {
  value: number;
  labelTranslateKey: string;
}

export type Options = Option[];
