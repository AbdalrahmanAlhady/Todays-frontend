import { Component, Input } from '@angular/core';
import { Comment } from 'src/app/shared/models/comment.model';
import { UserService } from 'src/app/shared/services/user.service';
import { format } from 'timeago.js';

@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css'
})
export class CommentComponent {
  @Input() comment!:Comment;
  timeAgo: string = '';

  constructor(private userService: UserService) {}
  ngOnInit(): void {
    this.calculateCommentDate();
    // handle user profile image
    this.comment.user = this.userService.spreadUserMedia(this.comment.user!); 
  }

  calculateCommentDate(): any {
    this.timeAgo = format(new Date(this.comment.createdAt!));
  }
}
