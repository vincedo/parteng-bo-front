/**
 * @file
 * Not a classic Angular component in that it doesn't display anything.
 * Its role is to set the page title from the template, where it's easier
 * to access the async store values.
 */
import { Component, ChangeDetectionStrategy, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'parteng-page-title',
  template: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTitleComponent implements OnChanges {
  @Input() title!: string;

  constructor(private titleService: Title) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['title']) {
      this.titleService.setTitle(this.title);
    }
  }
}
