import { ValidatorFn, AbstractControl, ValidationErrors } from '@angular/forms';

/**
 * Return an error if the control value is not an integer.
 */
export function integerValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    return !Number.isInteger(control.value) ? { notAnInteger: true } : null;
  };
}
