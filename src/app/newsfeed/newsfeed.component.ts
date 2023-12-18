import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { PostsService } from '../shared/posts.service';
import { Post } from '../shared/post.model';

@Component({
  selector: 'app-newsfeed',
  templateUrl: './newsfeed.component.html',
  styleUrls: ['./newsfeed.component.css'],
})
export class NewsfeedComponent implements OnInit {
  posts: Post[] = [];
  constructor(private postsService: PostsService) {}
  ngOnInit() {
    this.postsService.getPosts().subscribe((res) => {
      this.posts = res.body?.posts.rows!;
    });
  }
}
