import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { ServicesStore } from '@app/core/store/services.store';

@Component({
  selector: 'parteng-error-block',
  template: `
    <div class="p-2 my-3 text-red-600 bg-red-200 rounded" *ngIf="error">
      {{ error }}
      <div *ngIf="servicesErrors$ | async as servicesErrors">
        <div *ngFor="let error of servicesErrors">
          {{ error }}
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorMessageBlockComponent {
  @Input() error!: string;

  servicesErrors$ = this.servicesStore.errors$();

  constructor(private servicesStore: ServicesStore) {}

  ngOnInit() {
    this.servicesStore.errors$().subscribe((errors: any) => {
      console.log(errors);
    });
  }
}
