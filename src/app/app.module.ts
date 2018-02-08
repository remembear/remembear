import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule }   from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { LoginComponent } from './login.component';
import { MainComponent } from './main.component';
import { StudyComponent } from './study.component';
import { ViewComponent } from './view.component';
import { AutofocusDirective } from './autofocus.directive';

import { ApiService } from './api.service';
import { AuthGuardService } from './auth-guard.service';
import { AuthService } from './auth.service';
import { StatusService } from './status.service';

const appRoutes: Routes = [
  { path: 'main', component: MainComponent, canActivate: [AuthGuardService] },
  { path: 'study', component: StudyComponent, canActivate: [AuthGuardService] },
  { path: 'view', component: ViewComponent, canActivate: [AuthGuardService] },
  { path: 'login', component: LoginComponent },
  { path: '', redirectTo: '/main', pathMatch: 'full' },
  { path: '**', component: LoginComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    MainComponent,
    StudyComponent,
    ViewComponent,
    AutofocusDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RouterModule.forRoot(
      appRoutes,
      //{ enableTracing: true } // <-- debugging purposes only
    )
  ],
  providers: [ApiService, AuthGuardService, AuthService, StatusService],
  bootstrap: [AppComponent]
})
export class AppModule { }
