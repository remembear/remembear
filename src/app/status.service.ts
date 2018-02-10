import * as _ from 'lodash';
import { Injectable } from '@angular/core';

import { UserStatus, Question, Study, Answer } from './types';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

@Injectable()
export class StatusService {

  private username: string;
  private currentStudy: Study;
  private qsStillIncorrect: Question[];
  private answers: Map<Question, Answer>;

  public status: UserStatus;
  public currentQuestion: Question;
  private currentAnswer: Answer;
  private answerStartTime: number;
  private answered: boolean;

  constructor(private authService: AuthService, private apiService: ApiService) {
    this.username = this.authService.username;
    apiService.getUserStatus(this.username).then(s => this.status = s);
  }

  async startNewStudy() {
    this.currentStudy = await this.apiService.getNewQuestions(this.username);
    this.startStudy();
  }

  async startReviewStudy() {
    this.currentStudy = await this.apiService.getReviewQuestions(this.username);
    this.startStudy();
  }

  private startStudy() {
    this.qsStillIncorrect = _.clone(this.currentStudy.questions);
    this.answers = new Map();
    this.qsStillIncorrect.forEach(q =>
      this.answers.set(q, {wordId: q.wordId, attempts: [], duration: 0}));
    this.currentStudy.startTime = new Date(Date.now());
  }

  async nextQuestion(): Promise<Question> {
    this.answered = false;
    let nextIndex = _.random(this.qsStillIncorrect.length-1);
    this.currentQuestion = this.qsStillIncorrect[nextIndex];
    this.currentAnswer = this.answers.get(this.currentQuestion);
    this.answerStartTime = Date.now();
    return this.currentQuestion;
  }

  checkAnswer(answer: string): boolean {
    if (!this.answered) {
      this.answered = true;
      this.playCurrentWordAudio();
      //update answer
      this.currentAnswer.duration += Date.now()-this.answerStartTime;
      this.currentAnswer.attempts.push(answer);
      //check if correct
      let correct = this.currentQuestion.answers.indexOf(answer) >= 0;
      if (correct) {
        _.remove(this.qsStillIncorrect, q => q === this.currentQuestion);
      }
      if (this.done()) {
        this.currentStudy.endTime = new Date(Date.now());
        this.currentStudy.answers = Array.from(this.answers.values());
        this.apiService.sendResults(this.currentStudy, this.authService.username)
          .then(s => this.status = s);
      }
      return correct;
    }
  }

  done(): boolean {
    return this.qsStillIncorrect.length === 0;
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