import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, User } from './auth.service';

@Component({
  templateUrl: './login.component.html',
  styles: [`.container{
    min-height:1000;
  }`]
})
export class LoginComponent {
  private message: string;
  private user: User = {"username":"", "password":""};

  constructor(public authService: AuthService, public router: Router) {
    this.setMessage();
  }

  setMessage() {
    this.message = 'Logged ' + (this.authService.isLoggedIn ? 'in' : 'out');
  }

  login() {
    this.message = 'Trying to log in ...';

    this.authService.login(this.user).subscribe(() => {
      this.setMessage();
      if (this.authService.isLoggedIn) {
        // Get the redirect URL from our auth service
        // If no redirect has been set, use the default
        //let redirect = this.authService.redirectUrl ? this.authService.redirectUrl : '/main';
        let redirect = '/main';

        // Redirect the user
        this.router.navigate([redirect]);
      }
    });
  }

  logout() {
    this.authService.logout();
    this.setMessage();
  }
}