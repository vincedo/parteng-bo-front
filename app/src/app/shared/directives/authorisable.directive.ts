import { Directive, ElementRef, Input, OnInit } from '@angular/core';
import { distinctUntilChanged } from 'rxjs/operators';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PermissionKey, ResourceKey } from '@core/models/authorization.model';
import { PermissionService } from '@core/services/permission.service';
/**
 * This directive provides an easy way to activate/deactivate features in your application depending on permissions
 * Use it like a *ngIf directive
 * ```html
 *    <button parteng-requires-permission="update" parteng-requires-resource="projects"> you can update project </button>
 * ````
 * parteng-hide-unauthorised=true will hide the element if permission is false
 */

@UntilDestroy()
@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: '[parteng-requires-permission]',
})
export class AuthorisableDirective implements OnInit {
  @Input('parteng-requires-permission') permission!: PermissionKey;
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('parteng-requires-resource') resource!: ResourceKey;
  // eslint-disable-next-line @angular-eslint/no-input-rename
  @Input('parteng-hide-unauthorised')
  public set partengHideUnauthorised(value: string) {
    this.hideUnauthorised = '' + value !== 'false';
  }

  constructor(private _el: ElementRef, private readonly _permissionService: PermissionService) {}

  ngOnInit() {
    return;
    const element = this._el.nativeElement;
    this.opacity = element.style.opacity || 1;
    this.display = element.style.display || '';
    this.set(false); // need explicit permission...false by default

    this._permissionService
      .isAuthorized$(this.permission, this.resource)
      .pipe(distinctUntilChanged(), untilDestroyed(this))
      .subscribe((isEnabled) => {
        this.set(isEnabled);
      });
  }

  public unauthorisedClickHandler(elt: Event) {
    elt.preventDefault();
    elt.stopPropagation();
  }

  private hideUnauthorised = false;
  private opacity?: number;
  private display?: string;

  /*
     ceinture et bretelles :-) we set the disabled property for the target and its children
      and we also disable the click handler
   */
  private set(authorized: boolean) {
    const element = this._el.nativeElement;
    element['disabled'] = !authorized;
    const elementTypes = ['input', 'select', 'button'];
    const elements = element.querySelectorAll(elementTypes.join(','));
    elements.forEach((el: Element & { disabled?: boolean }) => {
      el.disabled = !authorized;
    });

    if (!authorized) {
      element.style.opacity = 0.35;
      if (this.hideUnauthorised) element.style.display = 'none';
      element.addEventListener('click', this.unauthorisedClickHandler, true);
    } else {
      element.style.opacity = this.opacity;
      if (this.hideUnauthorised) element.style.display = this.display;
      element.removeEventListener('click', this.unauthorisedClickHandler, true);
    }
  }
}
