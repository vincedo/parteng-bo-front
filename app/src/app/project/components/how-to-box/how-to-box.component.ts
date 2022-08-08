import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'parteng-how-to-box',
  templateUrl: './how-to-box.component.html',
  styleUrls: ['./how-to-box.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HowToBoxComponent {
  @Input() title!: string;
}
