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
  public isAudioQuestion: boolean;
  public currentAnswerString: string;
  private currentAnswer: Answer;
  private answerStartTime: number;
  private answered: boolean;

  constructor(private authService: AuthService, private apiService: ApiService) {
    this.username = this.authService.username;
    this.updateUserStatus();
  }

  private updateUserStatus() {
    this.apiService.getUserStatus(this.username).then(s => this.status = s);
  }

  async startNewStudy(setIndex: number, dirIndex: number) {
    this.currentStudy = await this.apiService.getNewQuestions(this.username, setIndex, dirIndex);
    this.startStudy();
  }

  async startReviewStudy(setIndex: number, dirIndex: number) {
    this.currentStudy = await this.apiService.getReviewQuestions(this.username, setIndex, dirIndex);
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
    this.isAudioQuestion = this.currentQuestion.question.indexOf('.mp3') > 0;
    this.currentAnswer = this.answers.get(this.currentQuestion);
    this.answerStartTime = Date.now();
    if (this.isAudioQuestion) {
      this.playCurrentWordAudio();
    }
    return this.currentQuestion;
  }

  checkAnswer(answer: string): boolean {
    if (!this.answered) {
      answer = this.normalizeAnswer(answer);
      this.answered = true;
      this.playCurrentWordAudio();
      //update answer
      this.currentAnswerString = answer;
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

  private normalizeAnswer(answer: string) {
    answer = answer.replace(/ *\([^)]*\) */g, ""); //remove parentheses
    return _.trim(_.toLower(answer));
  }

  done(): boolean {
    return this.qsStillIncorrect.length === 0;
  }

  playCurrentWordAudio() {
    if (this.currentQuestion && this.currentQuestion.audio) {
      let audio = new Audio();
      audio.src = this.currentQuestion.audio;
      audio.load();
      audio.play();
    }
  }

}