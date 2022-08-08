import { Component, ChangeDetectionStrategy, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'parteng-homepage-block',
  templateUrl: './homepage-block.component.html',
  styleUrls: ['./homepage-block.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomepageBlockComponent {
  @Input() icon!: string;
  @Input() title!: string;
  @Input() description!: string;
  @Input() buttonLabel!: string;
  @Input() isDisabled = false;

  @Output() buttonClicked = new EventEmitter<void>();

  clickButton(): void {
    this.buttonClicked.emit();
  }
}
