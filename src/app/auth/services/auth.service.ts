import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../../shared/models/user.model';
import { BehaviorSubject } from 'rxjs';
import { EndPoint } from 'src/app/shared/endpoints/EndPoint';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  public $userToken = new BehaviorSubject<string | null>(
    JSON.parse(localStorage.getItem('userToken')!)
  );
  constructor(private http: HttpClient) {}

  isUserAuthorized() {
    return !!this.$userToken.getValue();
  }
  signup(user: User) {
    return this.http.post<{ user: User }>(
      `${EndPoint.API_ROOT}/${EndPoint.AUTH_API.Signup}`,
      user,
      { observe: 'response' ,headers: { 'skip': 'true'} }
    );
  }
  signin(email: string, password: string) {
    return this.http.post<{ user: User; token: string }>(
      `${EndPoint.API_ROOT}/${EndPoint.AUTH_API.Signin}`,
      { email, password },
      { observe: 'response' }
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
      { newPassword, cNewPassword, currentPassword, OTP,email },
      { observe: 'response' }
    );
  }
  verifyEmailViaOTP(OTP: string, email: string) {
    return this.http.post<{ message: string }>(
      `${EndPoint.API_ROOT}/${EndPoint.AUTH_API.verifyEmail}`,
      { OTP, email },
      { observe: 'response' }
    );
  }

  sendOTP(email: string) {
    return this.http.post<{ message: string }>(
      `${EndPoint.API_ROOT}/${EndPoint.AUTH_API.SendOTP}`,
      { email },
      { observe: 'response' }
    );
  }
}
