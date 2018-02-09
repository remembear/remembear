import * as _ from 'lodash';
import { Injectable } from '@angular/core';

import { Question } from './types';
import { ApiService } from './api.service';

@Injectable()
export class StatusService {

  private WORDS_PER_STUDY = 1;
  private qsInCurrentStudy: Question[];
  private qsStillIncorrect: Question[];

  public wordsKnownByLevel: number[];
  public totalPoints: number;
  public wordsStudied = 0;
  public currentQuestion: Question;

  constructor(private apiService: ApiService) {
    apiService.getWordsKnownByLevel().then(n => this.wordsKnownByLevel = n);
    apiService.getTotalPoints().then(n => this.totalPoints = n);
  }

  async startStudy() {
    this.wordsStudied = 0;
    this.qsInCurrentStudy = await this.apiService.getNewQuestions();
    console.log(this.qsInCurrentStudy)
    this.qsStillIncorrect = _.clone(this.qsInCurrentStudy);
  }

  async nextWord(): Promise<Question> {
    this.wordsStudied++;
    this.totalPoints += 150;
    let nextIndex = _.random(this.qsStillIncorrect.length-1);
    this.currentQuestion = this.qsStillIncorrect[nextIndex];
    return this.currentQuestion;
  }

  done(): boolean {
    return this.wordsStudied >= this.WORDS_PER_STUDY;
  }

  playCurrentWordAudio() {
    if (this.currentQuestion) {
      let audio = new Audio();
      audio.src = this.currentQuestion.audio;
      audio.load();
      audio.play();
    }
  }

}