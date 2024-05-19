import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app.routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { AngularFireStorageModule } from '@angular/fire/compat/storage';
import { AngularFireModule } from '@angular/fire/compat';
import { MatGridListModule } from '@angular/material/grid-list';
import { CarouselModule } from 'ngx-bootstrap/carousel';
import { ModalModule } from 'ngx-bootstrap/modal';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { VgCoreModule } from '@videogular/ngx-videogular/core';
import { VgControlsModule } from '@videogular/ngx-videogular/controls';
import { VgOverlayPlayModule } from '@videogular/ngx-videogular/overlay-play';
import { VgBufferingModule } from '@videogular/ngx-videogular/buffering';
import {MatMenu, MatMenuItem, MatMenuTrigger} from "@angular/material/menu";

import { AppComponent } from './app.component';
import { AuthComponent } from './auth/auth.component';
import { SignupComponent } from './auth/signup/signup.component';
import { SigninComponent } from './auth/signin/signin.component';
import { ProfileComponent } from './profile/profile.component';
import { NavbarComponent } from './navbar/navbar.component';
import { NewsfeedComponent } from './newsfeed/newsfeed.component';
import { CreatePostComponent } from './newsfeed/create-post/create-post.component';
import { AuthInterceptor } from './auth/auth_interceptor.service';
import { PostComponent } from './newsfeed/post/post.component';
import { CommentComponent } from './newsfeed/post/comment/comment.component';
import { ModalComponent } from './shared/components/modal/modal.component';
import { CreateCommentComponent } from './newsfeed/post/create-comment/create-comment.component';
import { VideoPlayerComponent } from './shared/components/video-player/video-player.component';
import { ChatComponent } from './chat/chat.component';
import { IconsBaseComponent } from './shared/components/icons/icons-base/icons-base.component';
import { LogoComponent } from './shared/components/icons/logo/logo.component';
import {MatDivider} from "@angular/material/divider";
import {NotificationIconComponent} from "./shared/components/icons/notification-icon/notification-icon.component";
import {NotificationComponent} from "./shared/components/notification/notification.component";

@NgModule({
  declarations: [
    AppComponent,
    AuthComponent,
    SignupComponent,
    SigninComponent,
    ProfileComponent,
    NavbarComponent,
    NewsfeedComponent,
    CreatePostComponent,
    PostComponent,
    CommentComponent,
    ModalComponent,
    CreateCommentComponent,
    VideoPlayerComponent,
    ChatComponent,
    IconsBaseComponent,
    LogoComponent,
    NotificationIconComponent,
    NotificationComponent
  ],
  imports: [
    BrowserModule,
    CommonModule,
    FormsModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatRadioModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatToolbarModule,
    MatGridListModule,
    MatMenu,
    ProgressbarModule,
    CarouselModule.forRoot(),
    ModalModule.forRoot(),
    VgCoreModule,
    VgControlsModule,
    VgOverlayPlayModule,
    VgBufferingModule,
    AngularFireModule.initializeApp({
      apiKey: 'AIzaSyA4xN_-VZDfBpz3i6XFw4en_XSigKED77E',
      authDomain: 'todays-2023.firebaseapp.com',
      databaseURL: 'https://todays-2023-default-rtdb.firebaseio.com',
      projectId: 'todays-2023',
      storageBucket: 'todays-2023.appspot.com',
      messagingSenderId: '850455187078',
      appId: '1:850455187078:web:8cb43f73a4f6f0ca290b07',
    }),
    AngularFireStorageModule,
    MatMenuTrigger,
    MatMenuItem,
    MatDivider,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
