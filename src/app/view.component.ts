import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { StatusService } from './services/status.service';

@Component({
  templateUrl: './view.component.html'
})
export class ViewComponent {

  constructor(private status: StatusService, public router: Router) {}

  next() {
    setTimeout(()=>this.router.navigate(['/study']), 50);
  }

}
