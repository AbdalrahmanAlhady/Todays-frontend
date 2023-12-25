import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, map, switchMap } from 'rxjs';
import { Post } from '../models/post.model';
import { AuthService } from 'src/app/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class PostsService {
  $newPost = new Subject<Post>();
  constructor(private http: HttpClient, private authService: AuthService) {}

  createPost(post: Post) {
    return this.http.post<{ post: Post }>(
      'http://localhost:3000/api/v1/posts',
      post,
      { observe: 'response' }
    );
  }
  getPosts() {
    return this.http.get<{ posts: { count: number; rows: Post[] } }>(
      'http://localhost:3000/api/v1/posts',
      { observe: 'response' }
    );
  }
  likePost(post_id: string) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('post_id', post_id);
    queryParams = queryParams.append('user_id', this.authService.getCurrentUserId());
    return this.http.post<{ message: string,likesCount:number }>(
      'http://localhost:3000/api/v1/posts/likePost',
      {},
      { observe: 'response', params: queryParams }
    );
  }
  isLikedPost(post_id: string) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('post_id', post_id);
    queryParams = queryParams.append('user_id', this.authService.getCurrentUserId());
    return this.http.get<{ postLiked: boolean }>(
      'http://localhost:3000/api/v1/posts/isLikedPost',
      { observe: 'response', params: queryParams }
    );
  }
}
