import * as _ from 'lodash';
import { Injectable } from '@angular/core';

import { UserStatus, Question, Study, Answer } from './types';
import { SETS } from './consts';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

@Injectable()
export class StatusService {

  public GRAPH_WIDTH = 500;
  public GRAPH_HEIGHT = 100;

  private username: string;
  private currentStudy: Study;
  private qsStillIncorrect: Question[];
  private answers: Map<Question, Answer>;

  public status: UserStatus;
  public pointsGraph = "";
  public studiesGraph = "";
  public timeGraph = "";
  public currentQuestion: Question;
  public isAudioQuestion: boolean;
  public showInfo: boolean;
  public currentAnswerString: string;
  private currentAnswer: Answer;
  private answerStartTime: number;
  private answered: boolean;

  constructor(private authService: AuthService, private apiService: ApiService) {
    this.username = this.authService.username;
    this.updateUserStatus();
  }

  private async updateUserStatus(status?: UserStatus) {
    if (!status) {
      status = await this.apiService.getUserStatus(this.username);
    }
    this.status = status;
    this.status.thinkingPerDay = this.status.thinkingPerDay.map(t => _.round(t));
    this.updateGraphs();
  }

  private updateGraphs() {
    this.pointsGraph = this.toGraph(this.status.pointsPerDay);
    this.studiesGraph = this.toGraph(this.status.studiesPerDay);
    this.timeGraph = this.toGraph(this.status.thinkingPerDay);
  }

  private toGraph(values: number[]) {
    if (values.length > 1) {
      let norm = this.GRAPH_HEIGHT/_.max(values);
      let interval = this.GRAPH_WIDTH/(values.length-1);
      return values
        .map((p,i) => (i*interval)+","+(this.GRAPH_HEIGHT+1-(norm*p))).join(" ");
    }
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
    this.qsStillIncorrect = _.shuffle(this.currentStudy.questions);
    this.answers = new Map();
    this.qsStillIncorrect.forEach(q =>
      this.answers.set(q, {wordId: q.wordId, attempts: []}));
    this.currentStudy.startTime = new Date(Date.now());
  }

  async nextQuestion(): Promise<Question> {
    this.answered = false;
    this.currentQuestion = this.qsStillIncorrect[0];
    this.isAudioQuestion = this.currentQuestion.question.indexOf('.mp3') > 0;
    this.showInfo = !this.isAudioQuestion
      && !(this.currentStudy.set == 1 && this.currentStudy.direction == 1);
    this.currentAnswer = this.answers.get(this.currentQuestion);
    this.answerStartTime = Date.now();
    if (this.isAudioQuestion) {
      this.playCurrentWordAudio();
    }
    return this.currentQuestion;
  }

  checkAnswer(answer: string): boolean {
    if (!this.answered) {
      this.answered = true;
      this.playCurrentWordAudio();
      //update answer
      this.currentAnswerString = answer;
      let attempt = {answer: answer, duration: Date.now()-this.answerStartTime};
      this.currentAnswer.attempts.push(attempt);
      //check if correct
      let correct = this.currentQuestion.answers.indexOf(this.normalizeAnswer(answer)) >= 0;
      this.qsStillIncorrect = _.drop(this.qsStillIncorrect);
      if (!correct) {
        this.qsStillIncorrect.push(this.currentQuestion);
      }
      if (this.done()) {
        this.currentStudy.endTime = new Date(Date.now());
        this.currentStudy.answers = Array.from(this.answers.values());
        this.apiService.sendResults(this.currentStudy, this.authService.username)
          .then(s => this.updateUserStatus(s));
      }
      return correct;
    }
  }

  private normalizeAnswer(answer: string) {
    answer = answer.replace(/ *\([^)]*\) */g, ""); //remove parentheses
    answer = answer.replace(/[\/&-.'* 。　]/g, ""); //remove special chars
    answer = _.trim(_.toLower(answer)); //lower case and remove whitespace
    answer = answer.replace(/s$/, ''); //remove trailing -s for plural
    return answer.replace(/th$/, ''); //remove trailing -th
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