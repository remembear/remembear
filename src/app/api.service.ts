import { Injectable } from '@angular/core';

import { Study, UserStatus } from './types';
import { User } from './auth.service';

@Injectable()
export class ApiService {

  private API_URL = "http://localhost:8060/";

  login(user: User): Promise<boolean> {
    return this.getJsonFromApi('login', user)
      .then(j => j['success']);
  }

  getUserStatus(username: string): Promise<UserStatus> {
    return this.getJsonFromApi('status', {username: username});
  }

  getNewQuestions(username: string): Promise<Study> {
    return this.getJsonFromApi('new', {username: username});
  }

  getReviewQuestions(username: string): Promise<Study> {
    return this.getJsonFromApi('review', {username: username});
  }

  async sendResults(study: Study, username: string): Promise<UserStatus> {
    return await this.postJsonToApi('results', study, {username: username});
  }

  private postJsonToApi(path: string, json: {}, params?: {}) {
    path = this.addParams(path, params);
    return fetch(this.API_URL+path, {
      method: 'post',
      body: JSON.stringify(json),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(r => r.text())
      .then(r => {console.log(r); return r})
      .then(t => JSON.parse(t))
      .catch(e => console.log(e));
  }

  private getJsonFromApi(path: string, params?: {}): Promise<{}> {
    path = this.addParams(path, params);
    return fetch(this.API_URL+path)
      .then(r => r.text())
      .then(t => JSON.parse(t))
      .catch(e => console.log(e));
  }

  private addParams(path, params?: {}) {
    if (params) {
      let paramStrings = Array.from(Object.keys(params))
        .map(k => k+"="+encodeURIComponent(params[k]));
      path += '?'+paramStrings.join('&');
    }
    return path;
  }

}