import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, map, switchMap } from 'rxjs';
import { Post } from './post.model';

@Injectable({
  providedIn: 'root',
})
export class PostsService {

  constructor(private http: HttpClient) {}

  createPost(post:Post){
    return this.http.post<{post:Post}>(
      'http://localhost:3000/api/v1/posts',
      post,
      { observe: 'response' }
    );
  }
  getPosts(){
    return this.http.get<{posts:{count:number,rows:Post[]}}>(
      'http://localhost:3000/api/v1/posts',
      { observe: 'response' }
    );
  }
}
