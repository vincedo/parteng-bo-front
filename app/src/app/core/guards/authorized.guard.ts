import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { PermissionKey, ResourceKey } from '@core/models/authorization.model';
import { PermissionService } from '@core/services/permission.service';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthorizedGuard implements CanActivate {
  public constructor(private readonly _router: Router, private readonly _permissionService: PermissionService) {}

  public canActivateChildren(route: ActivatedRouteSnapshot) {
    return this.canActivate(route);
  }

  public canActivate(route: ActivatedRouteSnapshot) {
    const permissionKey = route.data['permissionKey'] as PermissionKey;
    const resourceKey = route.data['resourceKey'] as ResourceKey;

    return firstValueFrom(this._permissionService.isAuthorized$(permissionKey, resourceKey)).then((enabled: boolean) =>
      enabled ? true : this._router.parseUrl('/')
    );
  }
}
