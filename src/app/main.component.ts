import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StatusService } from './status.service';

@Component({
  templateUrl: './main.component.html'
})
export class MainComponent {

  constructor(private status: StatusService, public router: Router) {}

  start() {
    this.status.startStudy();
    this.router.navigate(['/study']);
  }

}
