import { Component, Input } from '@angular/core';

@Component({
  selector: 'parteng-instrument-form-block',
  // Alors oui bon, voilà... C'est aussi sale qu'élégant :)
  // Disons qu'à terme on aura probablement un FormBlockComponent générique.
  template: `
    <parteng-transfer-form-block
      [title]="title"
      [isDisabled]="isDisabled"
      [active]="active"
      requires-permission="update"
      requires-resource="instrument-versions"
    >
      <ng-content></ng-content>
    </parteng-transfer-form-block>
  `,
})
export class InstrumentFormBlockComponent {
  @Input() title = '';
  @Input() isDisabled!: boolean;
  @Input() active: boolean = false;
}
