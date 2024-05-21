import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { Post } from '../models/post.model';
import { AuthService } from 'src/app/auth/auth.service';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  $newPost = new Subject<Post>();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private userService: UserService,
  ) {}

  createPost(post: Post) {
    return this.http.post<{ post: Post }>(
      'http://localhost:3000/api/v1/posts',
      post,
      { observe: 'response' },
    );
  }

  getPosts(user_id?: string, page?: string, postsNumber?: string) {
    let queryParams = new HttpParams();
    if (user_id) queryParams = queryParams.append('user_id', user_id);
    if (page) queryParams = queryParams.append('page', page);
    if (postsNumber) queryParams = queryParams.append('limit', postsNumber);
    return this.http.get<{ posts: { count: number; rows: Post[] } }>(
      'http://localhost:3000/api/v1/posts',
      { observe: 'response', params: queryParams },
    );
  }

  getPostById(post_id: string) {
    return this.http.get<{ post: Post }>(
      `http://localhost:3000/api/v1/posts/${post_id}`,
      { observe: 'response' },
    );
  }

  likePost(post_id: string) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('post_id', post_id);
    queryParams = queryParams.append(
      'user_id',
      this.userService.getCurrentUserId(),
    );
    return this.http.post<{
      message: string;
      likesCount: number;
      newLike: {
        id: string;
        first_name: string;
        last_name: string;
      };
    }>(
      'http://localhost:3000/api/v1/posts/likePost',
      {},
      { observe: 'response', params: queryParams },
    );
  }

  isLikedPost(post_id: string) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('post_id', post_id);
    queryParams = queryParams.append(
      'user_id',
      this.userService.getCurrentUserId(),
    );
    return this.http.get<{ postLiked: boolean }>(
      'http://localhost:3000/api/v1/posts/isLikedPost',
      { observe: 'response', params: queryParams },
    );
  }

  unlikePost(post_id: string) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('post_id', post_id);
    queryParams = queryParams.append(
      'user_id',
      this.userService.getCurrentUserId(),
    );
    return this.http.delete<{
      message: string;
      likesCount: number;
      newPostLikes: { id: string; first_name: string; last_name: string }[];
    }>('http://localhost:3000/api/v1/posts/unlikePost', {
      observe: 'response',
      params: queryParams,
    });
  }
}
