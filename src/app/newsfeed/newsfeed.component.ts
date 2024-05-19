import {Component, OnDestroy, OnInit} from '@angular/core';
import { PostsService } from '../shared/services/posts.service';
import { Post } from '../shared/models/post.model';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-newsfeed',
  templateUrl: './newsfeed.component.html',
  styleUrls: ['./newsfeed.component.css'],
})
export class NewsfeedComponent implements OnInit,OnDestroy {
  posts: Post[] = [];
  subscriptions= new Subscription();
  constructor(private postsService: PostsService) {}
  ngOnInit() {
    this.subscriptions.add(
    this.postsService.getPosts().subscribe((res) => {
      this.posts = res.body?.posts.rows!;
    }));
    this.subscriptions.add(
    this.postsService.$newPost.subscribe(post=>{
         this.posts.push(post)
    }))
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
