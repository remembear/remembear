import { Injectable } from '@angular/core';

import { Study, UserStatus, Edit } from '../shared/types';
import { User } from './auth.service';

@Injectable()
export class ApiService {

  private API_URL = "https://remembear-api.herokuapp.com/";//"http://localhost:8060/";

  login(user: User): Promise<boolean> {
    return this.getJsonFromApi('login', user)
      .then(j => j['success']);
  }

  getUserStatus(username: string): Promise<UserStatus> {
    return this.getJsonFromApi('status', {username: username});
  }

  getNewQuestions(username: string, setIndex: number, dirIndex: number): Promise<Study> {
    return this.getJsonFromApi('new', {username: username, setIndex: setIndex, dirIndex: dirIndex});
  }

  getReviewQuestions(username: string, setIndex: number, dirIndex: number): Promise<Study> {
    return this.getJsonFromApi('review', {username: username, setIndex: setIndex, dirIndex: dirIndex});
  }
  
  async editAnswer(edit: Edit, username: string): Promise<UserStatus> {
    return await this.postJsonToApi('edit', edit, {username: username});
  }

  async sendResults(study: Study, username: string): Promise<UserStatus> {
    return await this.postJsonToApi('results', study, {username: username});
  }
  
  async delayMemories(username: string): Promise<UserStatus> {
    return await this.getJsonFromApi('delay', {username: username});
  }

  private postJsonToApi(path: string, json: {}, params?: {}) {
    path = this.addParams(path, params);
    return fetch(this.API_URL+path, {
      method: 'post',
      body: JSON.stringify(json),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(r => r.text())
      //.then(r => {console.log(r); return r})
      .then(t => JSON.parse(t))
      .catch(e => console.log(e));
  }

  private getJsonFromApi(path: string, params?: {}): Promise<any> {
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