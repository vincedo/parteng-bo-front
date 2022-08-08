import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'parteng-transfer-form-block',
  templateUrl: './transfer-form-block.component.html',
  styleUrls: ['./transfer-form-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransferFormBlockComponent {
  @Input() title!: string;
  @Input() isDisabled!: boolean;
  @Input() active: boolean = false;
}
