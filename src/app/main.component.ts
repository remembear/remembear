import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StatusService } from './status.service';

@Component({
  templateUrl: './main.component.html'
})
export class MainComponent {

  constructor(private status: StatusService, public router: Router) {}

  async new() {
    await this.status.startNewStudy();
    this.router.navigate(['/study']);
  }

  async review() {
    await this.status.startReviewStudy();
    this.router.navigate(['/study']);
  }

}
