import * as _ from 'lodash';
import { Injectable } from '@angular/core';

import { ApiService, Word } from './api.service';

@Injectable()
export class StatusService {

  private WORDS_PER_STUDY = 1;
  private wordsInCurrentStudy: Word[];
  private wordsStillIncorrect: Word[];

  public wordsKnownByLevel: number[];
  public totalPoints: number;
  public wordsStudied = 0;
  public currentWord: Word;

  constructor(private apiService: ApiService) {
    apiService.getWordsKnownByLevel().then(n => this.wordsKnownByLevel = n);
    apiService.getTotalPoints().then(n => this.totalPoints = n);
  }

  async startStudy() {
    this.wordsStudied = 0;
    this.wordsInCurrentStudy = await Promise.all(
      _.times(this.WORDS_PER_STUDY, this.apiService.getRandomWord));
    this.wordsStillIncorrect = _.clone(this.wordsInCurrentStudy);
  }

  async nextWord(): Promise<Word> {
    this.wordsStudied++;
    this.totalWordsKnown++;
    this.totalPoints += 150;
    let nextIndex = _.random(this.wordsStillIncorrect.length);
    this.currentWord = this.wordsStillIncorrect[nextIndex];
    return this.currentWord;
  }

  done(): boolean {
    console.log(this.wordsStudied, this.WORDS_PER_STUDY)
    return this.wordsStudied >= this.WORDS_PER_STUDY;
  }

  playCurrentWordAudio() {
    if (this.currentWord) {
      let audio = new Audio();
      audio.src = this.currentWord.audio;
      audio.load();
      audio.play();
    }
  }

}