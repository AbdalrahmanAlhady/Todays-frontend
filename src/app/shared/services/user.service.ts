import { Injectable } from '@angular/core';
import { jwtDecode } from 'jwt-decode';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { User } from '../models/user.model';
import { AuthService } from '../../auth/services/auth.service';
import { Router } from '@angular/router';
import { EndPoint } from '../endpoints/EndPoint';
import { Friendship } from '../models/friendship.model';

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
    if (this.authService.$userAccessToken.getValue()) {
      return jwtDecode<{ any: any; id: string }>(
        this.authService.$userAccessToken.getValue()!
      ).id;
    } else {
      return '';
    }
  }
  getUser(id: string) {
    return this.http.get<{ user: User }>(
      `${EndPoint.API_ROOT}/${EndPoint.USERS_API}/${id}`,
      {
        observe: 'response',
      }
    );
  }
  checkFriendshipStatus(sender_id: string, receiver_id: string) {
    return this.http.get<{
      friendship_status: 'requested' | 'accepted' | 'none';
    }>(
      `${EndPoint.API_ROOT}/${EndPoint.FRIENDSHIPS_API}/sender/${sender_id}/receiver/${receiver_id}`,
      {
        observe: 'response',
      }
    );
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
      { status: 'accepted' },
      { observe: 'response' }
    );
  }
  declineFriendRequest(sender_id: string, receiver_id: string) {
    return this.http.delete<{ message: string }>(
      `${EndPoint.API_ROOT}/${EndPoint.FRIENDSHIPS_API}/sender/${sender_id}/receiver/${receiver_id}`,
      { observe: 'response' }
    );
  }
  getUserFriends(user_id: string, page?: string, friendsNumber?: string) {
    let queryParams = new HttpParams();
    if (page) queryParams = queryParams.append('page', page);
    if (friendsNumber) queryParams = queryParams.append('limit', friendsNumber);
    return this.http.get<{
      friendships: { count: number; rows: Friendship[] };
    }>(`${EndPoint.API_ROOT}/${EndPoint.FRIENDSHIPS_API}/user/${user_id}`, {
      observe: 'response',
      params: queryParams,
    });
  }
  updateUser(user_id: string, updateData: any) {
    return this.http.patch<{ user: User }>(
      `${EndPoint.API_ROOT}/${EndPoint.USERS_API}/${user_id}`,
      updateData,
      { observe: 'response' }
    );
  }
  spreadUserMedia( userContainsMedia: User) {
    const coverMedia = userContainsMedia.media?.find(media => media.for === 'cover');
    userContainsMedia.profileCoverImg = coverMedia ? coverMedia.url : undefined;
  
    const profileMedia = userContainsMedia.media?.find(media => media.for === 'profile');
    userContainsMedia.profileImg = profileMedia ? profileMedia.url : undefined;
  let {media,...user} = userContainsMedia
    return user;
  }
}
