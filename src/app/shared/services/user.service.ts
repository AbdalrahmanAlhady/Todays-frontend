import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { HttpClient, HttpParams } from '@angular/common/http';
import { User } from '../models/user.model';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';
import { EndPoint } from '../endpoints/EndPoint';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private router: Router
  ) {}

  getCurrentUserId() {
    return jwtDecode<{ any: any; id: string }>(
      this.authService.$userToken.getValue()!
    ).id;
  }
  getUser(id: string) {
    return this.http.get<{ user: User }>(`${EndPoint.API_ROOT}/${EndPoint.USERS_API}/${id}`, {
      observe: 'response',
    });
  }
  checkFriendshipStatus(sender_id: string, receiver_id: string) {
    return this.http.get<{
      friendship_status: 'requested' | 'accepted' | 'none';
    }>(`${EndPoint.API_ROOT}/${EndPoint.FRIENDSHIPS_API}/sender/${sender_id}/receiver/${receiver_id}`, {
      observe: 'response',

    });
  }
  sendFriendRequest(sender_id: string, receiver_id: string) {
    return this.http.post<{ message: string }>(
      `${EndPoint.API_ROOT}/${EndPoint.FRIENDSHIPS_API}/sender/${sender_id}/receiver/${receiver_id}`,
      {},
      { observe: 'response' }
    );
  }
  acceptFriendRequest(sender_id: string, receiver_id: string) {
    return this.http.patch<{ message: string }>(
      `${EndPoint.API_ROOT}/${EndPoint.FRIENDSHIPS_API}/sender/${sender_id}/receiver/${receiver_id}`,
      {status:'accepted'},
      { observe: 'response' }
    );
  }
  declineFriendRequest(sender_id: string, receiver_id: string) {
    return this.http.delete<{ message: string }>(
      `${EndPoint.API_ROOT}/${EndPoint.FRIENDSHIPS_API}/sender/${sender_id}/receiver/${receiver_id}`,
      { observe: 'response' }
    );
  }
}
