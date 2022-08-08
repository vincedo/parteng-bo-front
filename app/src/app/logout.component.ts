import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'parteng-logout',
  template: ` <div class="mt-40">
    <mat-spinner class="mx-auto" diameter="50"></mat-spinner>
  </div>`,
})
export class LogoutComponent {
  constructor(private router: Router, private authService: AuthService) {}

  async ngOnInit() {
    this.authService.deleteToken();
    this.router.navigate(['/']);
  }
}
