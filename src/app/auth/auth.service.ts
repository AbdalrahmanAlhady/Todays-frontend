import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { User } from '../shared/user.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}
  signup(user: User) {
   return this.http.post<User>('http://localhost:3000/api/v1/auth/signup', user);
  }
}
