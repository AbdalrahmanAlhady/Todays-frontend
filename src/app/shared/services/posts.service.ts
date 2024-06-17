import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Post } from '../models/post.model';
import { AuthService } from 'src/app/auth/services/auth.service';
import { UserService } from './user.service';
import { EndPoint } from '../endpoints/EndPoint';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  $newPost = new Subject<Post>();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService
  ) {}

  createPost(post: Post) {
    return this.http.post<{ post: Post }>(
      `${EndPoint.API_ROOT}/${EndPoint.POSTS_API}`,
      post,
      { observe: 'response' }
    );
  }

  getPosts(
    user_id?: string,
    page?: string,
    postsNumber?: string,
    post_id?: string
  ) {
    let queryParams = new HttpParams();
    if (user_id) queryParams = queryParams.append('user_id', user_id);
    if (page) queryParams = queryParams.append('page', page);
    if (postsNumber) queryParams = queryParams.append('limit', postsNumber);
    if (post_id) queryParams = queryParams.append('id', post_id);
    return this.http.get<{ posts: { count: number; rows: Post[] } }>(
      `${EndPoint.API_ROOT}/${EndPoint.POSTS_API}`,
      { observe: 'response', params: queryParams }
    );
  }

  likePost(post_id: string) {
    return this.http.post<{
      message: string;
      likesCount: number;
      newLike: {
        id: string;
        first_name: string;
        last_name: string;
      };
    }>(
      `${EndPoint.API_ROOT}/${EndPoint.POST_LIKES_API}/user/${this.userService.getCurrentUserId()}/post/${post_id}`,
      {},
      { observe: 'response' }
    );
  }

  isLikedPost(post_id: string) {
    return this.http.get<{ postLiked: boolean }>(
      `${EndPoint.API_ROOT}/${EndPoint.POST_LIKES_API}/user/${this.userService.getCurrentUserId()}/post/${post_id}`,
      { observe: 'response' }
    );
  }

  unlikePost(post_id: string) {
    return this.http.delete<{
      message: string;
      likesCount: number;
      newPostLikes: { id: string; first_name: string; last_name: string }[];
    }>(
      `${EndPoint.API_ROOT}/${EndPoint.POST_LIKES_API}/user/${this.userService.getCurrentUserId()}/post/${post_id}`,
      {
        observe: 'response',
      }
    );
  }
}
