import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Comment } from '../models/comment.model';
import { Subject } from 'rxjs';
import { EndPoint } from '../endpoints/EndPoint';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  $newComment = new Subject<Comment>();
  constructor(private http: HttpClient, private authService: AuthService) { }
  createComment(comment:Comment) {
    return this.http.post<{ comment: Comment }>(
      `${EndPoint.API_ROOT}/${EndPoint.COMMENTS_API}`,
      comment,
      { observe: 'response' }
    );
  }
  getComments(post_id: string, page?: string, postsNumber?: string) {
    let queryParams = new HttpParams();
    if (page) queryParams = queryParams.append('page', page);
    if (postsNumber) queryParams = queryParams.append('limit', postsNumber);
    return this.http.get<{ comments: { count: number; rows: Comment[] } }>(
      `${EndPoint.API_ROOT}/${EndPoint.COMMENTS_API}/post/${post_id}`,
      { observe: 'response', params: queryParams },
    );
  }
}
