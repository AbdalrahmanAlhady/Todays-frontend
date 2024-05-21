import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './auth/signup/signup.component';
import { SigninComponent } from './auth/signin/signin.component';
import { NewsfeedComponent } from './newsfeed/newsfeed.component';
import { AuthGuard } from './auth/auth.guard.service';
import { ProfileComponent } from './profile/profile.component';
import { ChatComponent } from './chat/chat.component';
import {PostComponent} from "./newsfeed/post/post.component";
import { AuthPageGuard } from './auth/authPage.guard.service';

const routes: Routes = [
  { path: 'newsfeed',canActivate: [AuthGuard], component: NewsfeedComponent },
  { path: '', redirectTo: 'newsfeed', pathMatch: 'full' },
  { path: 'signup', canActivate: [AuthPageGuard],component: SignupComponent },
  { path: 'signin', canActivate: [AuthPageGuard],component: SigninComponent },
  { path: 'profile/:user_id', component: ProfileComponent },
  { path: 'post/:post_id', component: PostComponent},
  { path: 'chat', component: ChatComponent },
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
