import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable, of, ReplaySubject } from 'rxjs';
import { PermissionKey, ResourceKey } from '@core/models/authorization.model';
import { switchMap, take } from 'rxjs/operators';
import { EntityWithId } from '@shared/models';
import { HALDeserializeFrom } from '@core/services/hal-serializer.service';
import { RestService } from '@core/services/rest.service';
import { environment } from '../../../environments/environment';
import { AuthService } from '@core/services/auth.service';

// quick tentative for using HAL deserialization
// cf Antoine
// this._halApiService.getOne$<Me>(Me, `/me`,  { /*sets: 'full' */ } )
//   .subscribe(r => console.log('me r=', r));

export type CrudTable = { [p in PermissionKey]?: { [r in ResourceKey]?: boolean } };

export class Me extends EntityWithId {
  @HALDeserializeFrom()
  display_name: string = '';
}

@Injectable({ providedIn: 'root' })
export class PermissionService {
  public readonly initialLoaded$: Observable<boolean>;
  private readonly _initialLoaded$ = new ReplaySubject<boolean>(1);
  private _toggling: BehaviorSubject<boolean> | undefined;
  private _isReadonly = false;
  private _enableToggling = true;
  // observable 'table' will be filled dynamically on demand
  private _permissions: { [p in PermissionKey]?: { [r in ResourceKey]?: BehaviorSubject<boolean> } } = {};
  // permissions 'table' computed from the backend's data
  private _crudTable: CrudTable = {};

  public constructor(
    // private readonly _halApiService: HalApiService,   // uncomment this line will crash the app at startup!
    private readonly restService: RestService,
    private readonly authService: AuthService
  ) {
    this.initialLoaded$ = this._initialLoaded$.asObservable();

    // check with Antoine why we need this!
    // conflict with token authentication ? if /me is called before authentication validated ?
    // for now we have a temporary workaround, but we need to clean up all the authent process instead
    this.initialRulesLoading();
  }

  public initialRulesLoading() {
    const interval = setInterval(() => {
      if (this.authService.getToken()) {
        clearInterval(interval);
        this.reload().then(
          () => {
            this._initialLoaded$.next(true);
            this._initialLoaded$.complete();
          },
          (reason) => {
            console.error('error on loading /me wait a bit ... and retry', reason);
          }
        );
      }
    });
  }

  public initialRulesLoadingOld() {
    this.reload().then(
      () => {
        this._initialLoaded$.next(true);
        this._initialLoaded$.complete();
      },
      (reason) => {
        console.error('error on loading /me wait a bit ... and retry', reason);
        return new Promise<void>((resolve) => {
          const interval = setInterval(() => {
            if (this.authService.getToken()) {
              clearInterval(interval);
              this.initialRulesLoading();
              resolve();
            }
          }, 1000);
        });
      }
    );
  }
  public reload(): Promise<void> {
    return firstValueFrom(this.restService.get({ url: `${environment.api.baseURL}/me` })).then((r: any) => {
      const data = r._embedded ? r._embedded.resources : r.resources; // depending on backend format
      const resources = PermissionService.parseResources(data);
      this._set(resources);
      return r;
    });
  }

  public static parseRoute = (route: string): { verb: string; resource: ResourceKey } => {
    const [longResource, verb] = route.split('^');
    return {
      verb,
      resource: longResource
        .replace(/\/\{\w+\}/, '')
        .split('/')
        .pop() as ResourceKey,
    };
  };
  // quick and dirty parsing
  // see with Antoine to use HALApiService instead
  public static parseResources(resources: any): CrudTable {
    const crud: CrudTable = {};
    Object.entries(resources).forEach((data: any) => {
      const route = data[1].route;
      let { verb, resource } = this.parseRoute(route);
      if (resource) {
        const mappings: { [k: string]: PermissionKey } = {
          POST: 'create',
          GET: 'read',
          PATCH: 'update',
          PUT: 'update',
          DELETE: 'delete',
        };
        const permissionKey = mappings[verb];
        if (!permissionKey) {
          console.error(`ignore verb ${verb}`);
        } else {
          let perm = crud[permissionKey];
          if (!perm) {
            perm = {};
            crud[permissionKey] = perm;
          }
          perm[resource] = true;
        }
      }
    });
    return crud;
  }

  /**
   * Is this permission enabled, this should only be used after checking initialLoaded$
   */
  public isAuthorized$(permissionKey: PermissionKey, resourceKey: ResourceKey): Observable<boolean> {
    return of(true);
    // return this.initialLoaded$.pipe(
    //   take(1),
    //   switchMap((_) => this._getPermissionSubject(permissionKey, resourceKey).asObservable())
    // );
  }

  private _set(crudTable: any) {
    this._crudTable = crudTable; // set table for requests to come
    // update existing ones.
    Object.keys(this._permissions)
      .filter((v) => v != 'toggling')
      .forEach((_verb) => {
        const verb = _verb as PermissionKey;
        Object.keys(this._permissions[verb]!).forEach((_resource) => {
          const resource = _resource as ResourceKey;
          const newVal = crudTable[verb][resource] || false;
          this._getPermissionSubject(verb, resource).next(this._isReadonly && verb != 'read' ? false : newVal);
        });
      });
    this._enableToggling = true;
  }

  // public for ... testing
  public set(crudTable: any): Promise<void> {
    return firstValueFrom(this.initialLoaded$).then(() => this._set(crudTable));
  }

  public forceReadonlyMode(isReadonly: boolean) {
    this._isReadonly = isReadonly;
    if (isReadonly) {
      // update existing ones.
      Object.keys(this._permissions)
        .filter((v) => v != 'read')
        .forEach((_verb) => {
          const verb = _verb as PermissionKey;
          Object.keys(this._permissions[verb]!).forEach((_resource) => {
            const resource = _resource as ResourceKey;
            this._getPermissionSubject(verb, resource).next(false);
          });
        });
      this._enableToggling = false;
      this._toggling?.next(false);
    } else {
      if (this._crudTable) {
        this._set(this._crudTable);
      }
    }
  }

  private _getPermissionSubject(permissionKey: PermissionKey, resourceKey: ResourceKey): BehaviorSubject<boolean> {
    let permissions = this._permissions[permissionKey];
    if (!permissions) {
      permissions = {};
      this._permissions[permissionKey] = permissions;
    }
    let targetPermission = permissions[resourceKey];
    if (!targetPermission) {
      if (permissionKey === 'toggling') {
        if (!this._toggling) {
          this._toggling = new BehaviorSubject<boolean>(true);
          let val = true;
          setInterval(() => {
            if (this._enableToggling) {
              val = !val;
              this._toggling!.next(val);
            }
          }, 100);
        }
        targetPermission = this._toggling!;
      } else if (!!this._crudTable[permissionKey]) {
        const val = this._crudTable[permissionKey]![resourceKey] ?? false;
        targetPermission = new BehaviorSubject<boolean>(this._isReadonly && permissionKey !== 'read' ? false : val);
      } else {
        targetPermission = new BehaviorSubject<boolean>(false);
      }
      permissions[resourceKey] = targetPermission;
    }
    return targetPermission;
  }
}
