import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../shared/models/user.model';
import { BehaviorSubject } from 'rxjs';

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
      'http://localhost:3000/api/v1/auth/signup',
      user,
      { observe: 'response' }
    );
  }
  signin(email: string, password: string) {
    return this.http.post<{ user: User; token: string }>(
      'http://localhost:3000/api/v1/auth/signin',
      { email, password },
      { observe: 'response' }
    );
  }


  isUserAuthorized() {
    return !!this.$userToken.getValue();
  }
}
