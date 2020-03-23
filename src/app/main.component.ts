import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StatusService, Graph } from './services/status.service';

import { Set } from './shared/types';
import { SETS } from './shared/consts';

@Component({
  templateUrl: './main.component.html'
})
export class MainComponent {

  private sets = SETS;
  protected graphIndex = 0;
  protected statusText = "";

  constructor(private status: StatusService, public router: Router) {}

  async new(setIndex: number, dirIndex: number) {
    await this.status.startNewStudy(setIndex, dirIndex);
    this.router.navigate(['/study']);
  }

  async review(setIndex: number, dirIndex: number) {
    await this.status.startReviewStudy(setIndex, dirIndex);
    this.router.navigate(['/study']);
  }

  swapGraphs() {
    this.graphIndex = (this.graphIndex + 1) % this.status.graphs.length;
  }
  
  async pushBackReviews() {
    this.statusText = "pushing back.......";
    await this.status.pushBackReviews();
    this.statusText = "done!";
    setTimeout(() => this.statusText = "", 2000);
  }
  
  async pushForwardReviews() {
    this.statusText = "pushing forward.......";
    await this.status.pushForwardReviews();
    this.statusText = "done!";
    setTimeout(() => this.statusText = "", 2000);
  }

}
