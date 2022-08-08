import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, Inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from 'src/environments/environment';

/**
 * This component is used to redirect to the Azure SSO login page.
 * It first gets the SSO URL from the API and then redirects to it.
 */
@Component({
  selector: 'parteng-login',
  template: ` <div class="mt-40">
    <mat-spinner class="mx-auto" diameter="50"></mat-spinner>
  </div>`,
})
export class LoginComponent {
  constructor(private http: HttpClient, @Inject(DOCUMENT) private document: Document) {}

  async ngOnInit() {
    const response: any = await firstValueFrom(
      this.http.post(`${environment.api.baseURL}/authentication`, { code: '' })
    );
    // TODO: manage error
    this.document.location.href = response['redirect'];
  }
}
