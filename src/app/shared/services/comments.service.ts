import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/auth/auth.service';
import { Comment } from '../models/comment.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  $newComment = new Subject<Comment>();
  constructor(private http: HttpClient, private authService: AuthService) { }
  createComment(comment:Comment) {
    return this.http.post<{ comment: Comment }>(
      'http://localhost:3000/api/v1/comments',
      comment,
      { observe: 'response' }
    );
  }
  getComments(post_id: string, page?: string, postsNumber?: string) {
    let queryParams = new HttpParams();
     queryParams = queryParams.append('post_id', post_id);
    if (page) queryParams = queryParams.append('page', page);
    if (postsNumber) queryParams = queryParams.append('limit', postsNumber);
    return this.http.get<{ comments: { count: number; rows: Comment[] } }>(
      'http://localhost:3000/api/v1/comments',
      { observe: 'response', params: queryParams },
    );
  }
}
