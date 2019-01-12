import * as _ from 'lodash';
import { Injectable } from '@angular/core';

import { UserStatus, Question, Study, Answer } from './shared/types';
import { SETS } from './shared/consts';
import { normalizeSingleAnswer, normalizeSentenceAnswer } from './shared/util';
import { AuthService } from './auth.service';
import { ApiService } from './api.service';

export interface Graph {
  name: string,
  values: number[],
  pointString: string,
  color: string,
  style: {}
}

interface GraphType {
  name: string,
  color: string,
  series: number[]
}

@Injectable()
export class StatusService {

  public GRAPH_WIDTH = 500;
  public GRAPH_HEIGHT = 100;

  private username: string;
  private currentStudy: Study;
  private qsStillIncorrect: Question[];
  private answers: Map<Question, Answer>;

  public status: UserStatus;

  public graphs: Graph[][] = [];
  public currentQuestion: Question;
  public isAudioQuestion: boolean;
  public showInfo: boolean;
  public currentAnswerString: string;
  public done: boolean;
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
    const thinkingPerStudy =
      _.zipWith(this.status.thinkingPerDay, this.status.studiesPerDay, _.divide)
        .map(v => _.round(v, 2))
    const types: GraphType[] = [
      {name:"studies", color:"blue", series: this.status.studiesPerDay},
      {name:"new learned", color:"lightblue", series: this.status.newPerDay},
      {name:"thinking", color:"red", series: this.status.thinkingPerDay},
      {name:"points", color:"black", series: this.status.pointsPerDay}
    ];
    this.graphs = [];
    this.graphs.push(types.map(t => this.toGraph(t, "daily ")));
    this.graphs.push(types.map(t => this.toGraph(t, "weekly ", 7)));
    this.graphs.push(types.map(t => this.toGraph(t, "monthly ", 30)));
  }

  private toGraph(type: GraphType, namePrefix: string, summarize?: number): Graph {
    let values = _.clone(type.series);
    if (summarize) {
      values.reverse();
      values = _.chunk(values, summarize).map(c => _.sum(c));
      values.reverse();
    }
    if (values.length > 0) {
      const norm = this.GRAPH_HEIGHT/_.max(values);
      const interval = this.GRAPH_WIDTH/(values.length-1);
      const pointString = values
        .map((p,i) => (i*interval)+","+(this.GRAPH_HEIGHT+1-(norm*p)))
        .join(" ");
      return {
        name: namePrefix + type.name,
        values: values,
        pointString: pointString,
        color: type.color,
        style: {'fill':'none','stroke':type.color,'stroke-width':1}
      }
    }
  }

  async startNewStudy(setIndex: number, dirIndex: number) {
    //console.log(this.getCurrentLocalTimeAsUTC())
    this.currentStudy = await this.apiService.getNewQuestions(this.username, setIndex, dirIndex);
    this.startStudy();
  }

  async startReviewStudy(setIndex: number, dirIndex: number) {
    this.currentStudy = await this.apiService.getReviewQuestions(this.username, setIndex, dirIndex);
    this.startStudy();
  }

  private startStudy() {
    this.done = false;
    this.qsStillIncorrect = _.shuffle(this.currentStudy.questions);
    this.answers = new Map();
    this.qsStillIncorrect.forEach(q =>
      this.answers.set(q, {wordId: q.wordId, attempts: []}));
    this.currentStudy.startTime = this.getCurrentLocalTimeAsUTC();
  }

  async nextQuestion(): Promise<Question> {
    this.answered = false;
    this.currentQuestion = this.qsStillIncorrect[0];
    this.currentQuestion.options = this.currentQuestion.options ?
      _.shuffle(this.currentQuestion.options) : undefined;
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
      if (!this.isAudioQuestion) {
        this.playCurrentWordAudio();
      }
      //update answer
      this.currentAnswerString = answer;
      let attempt = {answer: answer, duration: Date.now()-this.answerStartTime};
      this.currentAnswer.attempts.push(attempt);
      //check if correct
      let correct = false;
      if (answer.length > 0) { //always false when empty string
        if (this.currentStudy.set === 2) {
          correct = normalizeSentenceAnswer(this.currentQuestion.answers[0])
            === normalizeSentenceAnswer(answer)
        } else {
          //console.log(normalizeSingleAnswer(answer), this.currentQuestion.answers)
          correct = this.currentQuestion.answers.indexOf(normalizeSingleAnswer(answer)) >= 0;
        }
      }
      this.qsStillIncorrect = _.drop(this.qsStillIncorrect);
      if (!correct) {
        this.qsStillIncorrect.push(this.currentQuestion);
      }
      if (this.qsStillIncorrect.length === 0) { //done
        this.done = true;
        this.currentStudy.endTime = this.getCurrentLocalTimeAsUTC();
        this.currentStudy.answers = Array.from(this.answers.values());
        this.apiService.sendResults(this.currentStudy, this.authService.username)
          .then(s => this.updateUserStatus(s))
          //.then(() => this.done = true);
      }
      return correct;
    }
  }

  playCurrentWordAudio() {
    if (this.currentQuestion && this.currentQuestion.audio) {
      let audio = new Audio();
      audio.src = this.currentQuestion.audio;
      audio.load();
      audio.play();
    }
  }

  private getCurrentLocalTimeAsUTC(): Date {
    let date = new Date(Date.now());
    let offset = 0; //days
    date.setTime(date.getTime() - date.getTimezoneOffset()*60*1000 - 24*offset*60*60*1000)
    //console.log("current offset:", offset, "days, time: ", new Date(date))
    return date;
  }

}