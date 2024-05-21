import { Component, OnDestroy, OnInit } from '@angular/core';
import { PostsService } from '../shared/services/posts.service';
import { Post } from '../shared/models/post.model';
import { Observable, of, Subscription } from 'rxjs';
@Component({
  selector: 'app-newsfeed',
  templateUrl: './newsfeed.component.html',
  styleUrls: ['./newsfeed.component.css'],
})
export class NewsfeedComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  totalPosts: number = 0;
  subscriptions = new Subscription();
  currentPage: number = 1;
  constructor(private postsService: PostsService) {}
  ngOnInit() {
    this.subscriptions.add(
      this.postsService.getPosts(undefined, '1', '3').subscribe((res) => {
        this.posts = res.body?.posts.rows!;
        this.totalPosts = res.body?.posts.count!;
        this.currentPage++
      })
    );
    this.subscriptions.add(
      this.postsService.$newPost.subscribe((post) => {
        this.posts.push(post);
      })
    );
  }
  getNextPostPage() {   
    this.subscriptions.add(
      this.postsService
      .getPosts(undefined, this.currentPage.toString(), '3')
      .subscribe((res) => {
        this.posts.push(...res.body?.posts.rows!);
        console.log(this.posts);
        
        this.currentPage++;
      })
    );
  }
 
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
