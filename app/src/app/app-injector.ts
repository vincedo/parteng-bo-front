/**
 * @file
 * Static class storing the app-wide dependency injector.
 *
 * The injector is stored during AppModule instantiation,
 * and then used to avoid relying on dependency injection
 * in parent service classes or parent component classes.
 *
 * (If a parent service or component class uses DI,
 * it forces its children classes to relay all the dependencies...)
 */
import { Injector } from '@angular/core';

export class AppInjector {
  private static injector: Injector;

  static getInjector() {
    return AppInjector.injector;
  }

  static setInjector(injector: Injector) {
    AppInjector.injector = injector;
  }
}
