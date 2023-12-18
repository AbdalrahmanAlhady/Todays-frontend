import { Component, Input, OnInit } from '@angular/core';
import { Post } from 'src/app/shared/post.model';
import { format } from 'timeago.js';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit {
  timeAgo: string = '';
  ngOnInit(): void {
    this.calculatePostData();
  }
  @Input() post!: Post;
  calculatePostData(): any {
    this.timeAgo = format(new Date(this.post.createdAt!));
  }
}
