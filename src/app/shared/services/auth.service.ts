import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { User } from '../models/user.model';
import { BehaviorSubject, Subscription } from 'rxjs';
import { EndPoint } from 'src/app/shared/endpoints/EndPoint';
import { jwtDecode } from 'jwt-decode';
import { UserService } from 'src/app/shared/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  signedIn: boolean = false;
  subscriptions = new Subscription();
  public $userAccessToken = new BehaviorSubject<string | null>(
    JSON.parse(localStorage.getItem('accessToken')!)
  );

  public $userRefreshToken = new BehaviorSubject<string | null>(
    JSON.parse(localStorage.getItem('refreshToken')!)
  );

  constructor(private http: HttpClient, private injector: Injector) {}

  accessTokenExpiry() {
    let accessToken = jwtDecode(
      this.$userAccessToken.getValue()! ||
        JSON.parse(localStorage.getItem('accessToken')!)
    );
    return Math.floor((accessToken.exp! - Math.floor(Date.now() / 1000)) / 60);
  }
  refreshTokenExpiry() {
    let refreshToken = jwtDecode(
      this.$userRefreshToken.getValue()! ||
        JSON.parse(localStorage.getItem('refreshToken')!)
    );
    return Math.floor((refreshToken.exp! - Math.floor(Date.now() / 1000)) / 60);
  }
  signup(user: User) {
    return this.http.post<{ user: User }>(
      `${EndPoint.API_ROOT}/${EndPoint.AUTH_API.Signup}`,
      user,
      { observe: 'response', headers: { skip: 'true' } }
    );
  }
  signin(email: string, password: string) {
    return this.http.post<{
      user: User;
      accessToken: string;
      refreshToken: string;
    }>(
      `${EndPoint.API_ROOT}/${EndPoint.AUTH_API.Signin}`,
      { email, password },
      { observe: 'response', headers: { skip: 'true' } }
    );
  }
  refreshAccessToken() {
    return this.http.post<{
      newAccessToken: string;
    }>(
      `${EndPoint.API_ROOT}/${EndPoint.AUTH_API.refreshToken}`,
      { refreshToken: JSON.parse(localStorage.getItem('refreshToken')!) },
      { observe: 'response', headers: { skip: 'true' } }
    );
  }
  changeOrForgetPassword(
    email: string,
    newPassword: string,
    cNewPassword: string,
    currentPassword?: string,
    OTP?: string //only in forget password
  ) {
    return this.http.post<{ message: string }>(
      `${EndPoint.API_ROOT}/${EndPoint.AUTH_API.changePassword}`,
      { newPassword, cNewPassword, currentPassword, OTP, email },
      { observe: 'response', headers: { skip: 'true' } }
    );
  }
  verifyEmailViaOTP(OTP: string, email: string) {
    return this.http.post<{ message: string }>(
      `${EndPoint.API_ROOT}/${EndPoint.AUTH_API.verifyEmail}`,
      { OTP, email },
      { observe: 'response', headers: { skip: 'true' } }
    );
  }
  sendOTP(email: string) {
    return this.http.post<{ message: string }>(
      `${EndPoint.API_ROOT}/${EndPoint.AUTH_API.SendOTP}`,
      { email },
      { observe: 'response' }
    );
  }
  signout(user_id: string) {
    this.http
      .post<{message: string }>(
        `${EndPoint.API_ROOT}/${EndPoint.AUTH_API.Signout}/${user_id}`,
        {},
        { observe: 'response', headers: { skip: 'true' } }
      )
      .subscribe({
        next: (res) => {
          if (res.body?.message === 'user signed out') {
            
            this.signedIn = false;
            localStorage.clear();
            window.location.reload();
          }
        },
        error: (err) => {
          console.log(err.error.message);
        },
      });
  }
}
