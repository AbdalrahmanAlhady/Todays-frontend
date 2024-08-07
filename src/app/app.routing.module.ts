import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SignupComponent } from './auth/components/signup/signup.component';
import { SigninComponent } from './auth/components/signin/signin.component';
import { NewsfeedComponent } from './newsfeed/newsfeed.component';
import { AuthGuard } from './auth/services/auth.guard.service';
import { ProfileComponent } from './profile/profile.component';
import { ConversationComponent } from './conversation-list/components/conversation/conversation.component';
import { PostComponent } from './newsfeed/components/post/post.component';
import { AuthPageGuard } from './auth/services/authPage.guard.service';
import { VerifyOtpComponent } from './shared/components/verify-otp/verify-otp.component';

const routes: Routes = [
  { path: 'newsfeed',canActivate: [AuthGuard], component: NewsfeedComponent },
  { path: '', redirectTo: 'newsfeed', pathMatch: 'full' },
  { path: 'signup', canActivate: [AuthPageGuard],component: SignupComponent },
  { path: 'signin', canActivate: [AuthPageGuard],component: SigninComponent },
  { path: 'profile/:user_id',canActivate: [AuthGuard], component: ProfileComponent },
  { path: 'post/:post_id',canActivate: [AuthGuard], component: PostComponent},
  { path: 'chat', component: ConversationComponent },
  {path:'verifyOTP',component:VerifyOtpComponent}
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
