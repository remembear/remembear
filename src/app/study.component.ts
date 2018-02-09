import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StatusService } from './status.service';

@Component({
  templateUrl: './study.component.html'
})
export class StudyComponent {
  private answer: string;
  private bgColor: string;

  constructor(private status: StatusService, public router: Router) {
    this.next();
  }

  private next() {
    console.log("NExT", this.status.done())
    this.answer = null;
    this.bgColor = 'White';
    if (!this.status.done()) {
      this.status.nextWord();
    } else {
      this.router.navigate(['/main']);
    }
  }

  private check() {
    if (this.answer && this.answer.length > 0) {
      if (this.status.currentQuestion.answers.indexOf(this.answer) >= 0) {
        this.bgColor = 'PaleGreen';
        setTimeout(this.next.bind(this), 2500);
      } else {
        this.bgColor = 'LightCoral';
        setTimeout(() => this.router.navigate(['/view']), 2500);
      }
      this.status.playCurrentWordAudio();
    }
  }

}
