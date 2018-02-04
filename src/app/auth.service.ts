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

  // store the URL so we can redirect after logging in
  redirectUrl: string;

  login(user: User): Observable<boolean> {
    return Observable.fromPromise(this.apiService.login(user))
      .do(val => this.isLoggedIn = true);
  }

  logout(): void {
    this.isLoggedIn = false;
  }
}