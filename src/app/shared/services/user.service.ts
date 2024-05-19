import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../models/user.model';
import { AuthService } from '../../auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private authService: AuthService, private http: HttpClient) {}

  getCurrentUserId() {
    return jwtDecode<{ any: any; id: string }>(
      this.authService.$userToken.getValue()!
    ).id;
  }
  getUser(id: string) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('id', id);
    return this.http.get<{ user: User }>('http://localhost:3000/api/v1/user', {
      observe: 'response',
      params: queryParams,
    });
  }
  checkFriendshipStatus(sender_id: string, receiver_id: string) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('sender_id', sender_id);
    queryParams = queryParams.append('receiver_id', receiver_id);
    return this.http.get<{
      friendship_status: 'requested' | 'accepted' | 'none';
    }>('http://localhost:3000/api/v1/user/checkFriendship', {
      observe: 'response',
      params: queryParams,
    });
  }
  sendFriendRequest(sender_id: string, receiver_id: string) {
    return this.http.post<{ message: string }>(
      'http://localhost:3000/api/v1/user/sendFriendRequest',
      {
        sender_id,
        receiver_id,
      }
    );
  }
  acceptFriendRequest(sender_id: string, receiver_id: string) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('sender_id', sender_id);
    queryParams = queryParams.append('receiver_id', receiver_id);
    return this.http.patch<{ message: string }>(
      'http://localhost:3000/api/v1/user/acceptFriendRequest',
      {},
      { observe: 'response', params: queryParams }
    );
  }
  declineFriendRequest(sender_id: string, receiver_id: string) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('sender_id', sender_id);
    queryParams = queryParams.append('receiver_id', receiver_id);
    return this.http.delete<{ message: string }>(
      'http://localhost:3000/api/v1/user/unfriendOrDeclineFriendRequest',
      { observe: 'response', params: queryParams }
    );
  }
}
