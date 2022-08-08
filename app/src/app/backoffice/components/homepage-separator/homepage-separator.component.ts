import { Component, ChangeDetectionStrategy, Input } from '@angular/core';

@Component({
  selector: 'parteng-homepage-separator',
  templateUrl: './homepage-separator.component.html',
  styleUrls: ['./homepage-separator.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomepageSeparatorComponent {
  @Input() title!: string;
}
