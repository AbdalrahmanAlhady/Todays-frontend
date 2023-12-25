import { Component, Input } from '@angular/core';
import { Comment } from 'src/app/shared/models/comment.model';
import { format } from 'timeago.js';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css'
})
export class CommentComponent {
  @Input() comment!:Comment;
  timeAgo: string = '';
  ngOnInit(): void {
    this.calculateCommentDate();
  }

  calculateCommentDate(): any {
    this.timeAgo = format(new Date(this.comment.createdAt!));
  }
}
