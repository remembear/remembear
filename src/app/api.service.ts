import { Injectable } from '@angular/core';

import { Question } from './types';
import { User } from './auth.service';

@Injectable()
export class ApiService {

  private API_URL = "http://localhost:8060/";

  login(user: User): Promise<boolean> {
    return this.getJsonFromApi('login', user)
      .then(j => j['success']);
  }

  getWordsKnownByLevel(): Promise<number[]> {
    return Promise.resolve([0]);
  }

  getTotalPoints(): Promise<number> {
    return Promise.resolve(0);
  }

  getNewQuestions(): Promise<Question[]> {
    return this.getJsonFromApi('test');
  }

  private getJsonFromApi(path: string, params?: {}): Promise<{}> {
    if (params) {
      let paramStrings = Array.from(Object.keys(params))
        .map(k => k+"="+encodeURIComponent(params[k]));
      path += '?'+paramStrings.join('&');
    }
    return fetch(this.API_URL+path)
      .then(r => r.text())
      .then(r => {console.log(r); return r})
      .then(t => JSON.parse(t))
      .catch(e => console.log(e));
  }

}