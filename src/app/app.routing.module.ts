import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './auth/signup/signup.component';
import { SigninComponent } from './auth/signin/signin.component';
import { NewsfeedComponent } from './newsfeed/newsfeed.component';
import { AuthGuard } from './auth/auth.guard.service';

const routes: Routes = [
  { path: 'newsfeed',canActivate: [AuthGuard], component: NewsfeedComponent },
  { path: '', redirectTo: 'newsfeed', pathMatch: 'full' },
  { path: 'signup', component: SignupComponent },
  { path: 'signin', component: SigninComponent },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
