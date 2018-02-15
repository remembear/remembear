import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StatusService } from './status.service';

@Component({
  templateUrl: './study.component.html'
})
export class StudyComponent {
  private DELAY = 2000;
  private timeout;
  private answer: string;
  private checked: boolean;
  private correct: boolean;
  private bgColor: string;

  constructor(private status: StatusService, public router: Router) {
    this.next();
  }

  private next() {
    this.answer = "";
    this.checked = false;
    this.bgColor = 'White';
    if (!this.status.done()) {
      this.status.nextQuestion();
    } else {
      this.router.navigate(['/main']);
    }
  }

  private check() {
    //only check once!
    if (!this.checked) {
      this.checked = true;
      this.correct = this.status.checkAnswer(this.answer);
      if (this.correct) {
        this.bgColor = 'PaleGreen';
        this.timeout = setTimeout(this.next.bind(this), this.DELAY);
      } else {
        this.bgColor = 'LightCoral';
        this.timeout = setTimeout(() => this.router.navigate(['/view']), this.DELAY);
      }
    } else if (this.checked) {
      //shortcut
      clearTimeout(this.timeout);
      if (this.correct) {
        this.next();
      } else {
        setTimeout(() => this.router.navigate(['/view']), 50);
      }
    }
  }

}
