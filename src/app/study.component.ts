import * as _ from 'lodash';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StatusService } from './services/status.service';

@Component({
  templateUrl: './study.component.html'
})
export class StudyComponent {
  private DELAY = 3000;
  private timeout;
  private answer: string;
  private checked: boolean;
  private correct: boolean;
  private bgColor: string;
  private TIME_LIMIT = 10;
  private timeRemaining: number;
  private timer;

  constructor(private status: StatusService, public router: Router) {
    this.next();
  }

  private next() {
    this.answer = "";
    this.checked = false;
    this.bgColor = 'White';
    if (!this.status.done) {
      this.status.nextQuestion();
      this.timeRemaining = this.TIME_LIMIT;
      this.timer = setInterval(this.decrementTimer.bind(this), 1000);
    } else {
      this.router.navigate(['/main']);
    }
  }

  private decrementTimer() {
    this.timeRemaining--;
    if (this.timeRemaining === 0) {
      this.check();
    }
  }

  private setAnswer(answer: string) {
    this.answer = answer;
  }

  private check() {
    //only check once!
    if (!this.checked) {
      this.checked = true;
      clearInterval(this.timer);
      this.correct = this.status.checkAnswer(this.answer);
      if (this.correct) {
        this.bgColor = 'PaleGreen';
        this.timeout = setTimeout(this.next.bind(this), this.DELAY);
      } else {
        this.bgColor = 'LightCoral';
        this.timeout = setTimeout(() => this.router.navigate(['/view']), this.DELAY);
      }
    } else if (this.checked) {
      //accelerate
      clearTimeout(this.timeout);
      if (this.correct) {
        this.next();
      } else {
        setTimeout(() => this.router.navigate(['/view']), 50);
      }
    }
  }

}
