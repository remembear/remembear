import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/operator/do';

import { ApiService } from './api.service';

export interface User {
  username: string;
  password: string;
}

@Injectable()
export class AuthService {
  constructor(private apiService: ApiService) {}
  isLoggedIn = false;
  username: string;

  // store the URL so we can redirect after logging in
  redirectUrl: string;

  login(user: User): Observable<boolean> {
    return Observable.fromPromise(this.apiService.login(user))
      .do(success => {
        if (success) {
          this.isLoggedIn = true;
          this.username = user.username;
        }
      });
  }

  logout(): void {
    this.isLoggedIn = false;
    this.username = undefined;
  }
}