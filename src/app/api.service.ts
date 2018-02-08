import { Injectable } from '@angular/core';

import { User } from './auth.service';

export interface Word {
  japanese: string,
  kana: string,
  translation: string,
  info: string,
  audio: string
}

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

  getRandomWord(): Promise<Word> {
    return this.getJsonFromApi('test')
      .then(w => this.toWord(w));
  }

  private toWord(word: {}): Word {
    let audio = word["Vocab-audio"];
    audio = 'http://localhost:8060/'+audio.slice(7, audio.length-1);
    let info = [];
    if (word["Part of speech"]) info.push(word["Part of speech"]);
    if (word["Word-type"]) info.push(word["Word-type"]);
    //if (word["Vocab-structure"]) info.push("("+word["Vocab-structure"]+")");
    if (word["Vocab-RTK"]) info.push(word["Vocab-RTK"]);
    return {
      japanese: word["Vocab-japan"],
      kana: word["Vocab-kana"],
      translation: word["Vocab-translation"],
      info: info.join(', '),
      audio: audio
    }
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