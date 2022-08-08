import { Subscription } from 'rxjs';

export abstract class BaseService {
  protected subscriptions: Subscription[] = [];

  protected addSubscription(sub: Subscription): void {
    this.subscriptions.push(sub);
  }

  protected unsubscribeAll(): void {
    this.subscriptions.map((s) => s.unsubscribe());
    this.subscriptions = [];
  }
}
