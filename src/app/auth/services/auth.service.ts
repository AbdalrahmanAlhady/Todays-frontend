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
  signup(user: User) {
    return this.http.post<{user:User}>(
      `${EndPoint.API_ROOT}/${EndPoint.AUTH_API.Signup}`,
      user,
      { observe: 'response' }
    );
  }
  signin(email: string, password: string) {
    return this.http.post<{ user: User; token: string }>(
      `${EndPoint.API_ROOT}/${EndPoint.AUTH_API.Signin}`,
      { email, password },
      { observe: 'response' }
    );
  }


  isUserAuthorized() {
    return !!this.$userToken.getValue();
  }
}
