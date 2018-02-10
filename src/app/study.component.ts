import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StatusService } from './status.service';

@Component({
  templateUrl: './study.component.html'
})
export class StudyComponent {
  private DELAY = 2000;
  private answer: string;
  private checked: boolean;
  private bgColor: string;

  constructor(private status: StatusService, public router: Router) {
    this.next();
  }

  private next() {
    this.answer = null;
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
    if (!this.checked && this.answer && this.answer.length > 0) {
      this.checked = true;
      if (this.status.checkAnswer(this.answer)) {
        this.bgColor = 'PaleGreen';
        setTimeout(this.next.bind(this), this.DELAY);
      } else {
        this.bgColor = 'LightCoral';
        setTimeout(() => this.router.navigate(['/view']), this.DELAY);
      }
    }
  }

}
