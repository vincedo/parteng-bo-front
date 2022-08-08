import { APP_BASE_HREF, DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AuthService } from './core/services/auth.service';
import { PermissionService } from '@core/services/permission.service';

/**
 * This component is linked to the /oauth2 route.
 * Azure will give us a code (query parameter) to exchange for a token given by the API.
 */
@Component({
  selector: 'parteng-auth',
  template: ` <div class="mt-40">
    <mat-spinner class="mx-auto" diameter="50"></mat-spinner>
  </div>`,
})
export class AuthComponent {
  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private http: HttpClient,
    private router: Router,
    private permissionService: PermissionService,
    @Inject(DOCUMENT) private document: Document,
    @Inject(APP_BASE_HREF) private baseHref: string
  ) {}

  async ngOnInit() {
    const response: any = await firstValueFrom(
      this.http.post(`${environment.api.baseURL}/authentication`, { code: this.route.snapshot.queryParams['code'] })
    );
    // TODO: manage error
    this.authService.setToken(response.token);
    this.document.location.href = `${this.baseHref}` || '/';
  }
}
