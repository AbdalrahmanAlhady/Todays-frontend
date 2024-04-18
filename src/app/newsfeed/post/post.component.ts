import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from 'src/app/shared/models/post.model';
import { CommentsService } from 'src/app/shared/services/comments.service';
import { PostsService } from 'src/app/shared/services/posts.service';
import { format } from 'timeago.js';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit {
  timeAgo: string = '';
  commentsCount: number = 0;
  likesCount: number = 0;
  showComments: boolean = false;
  postLikedByCurrentUser: boolean = false;
  modalRef?: BsModalRef;
  avgMediaDimensions: {
    width: number;
    height: number;
  } = {
    width: 0,
    height: 0,
  };
  @Input() post!: Post;
  constructor(
    private modalService: BsModalService,
    private postService: PostsService,
    private commentsService: CommentsService,
    private authService: AuthService
  ) {}
  ngOnInit(): void {
    this.calculatePostDate();
    this.countCommentsAndLikes();
    this.postService.isLikedPost(this.post.id!).subscribe((res) => {
      this.postLikedByCurrentUser = res.body!.postLiked;
    });
    this.commentsService.$newComment.subscribe((comment) => {
      if (comment.post_id === this.post.id) {
        this.post.comments?.push(comment);
        this.countCommentsAndLikes();
      }
    });
    if (this.post.media) {
      this.calcAvgMediaDimenisions();
    }
  }
  calculatePostDate() {
    this.timeAgo = format(new Date(this.post.createdAt!));
  }
  countCommentsAndLikes() {
    this.commentsCount = this.post.comments!.length;
    this.likesCount = this.post.likes!.length;
  }

  openComments(template: TemplateRef<void>) {
    this.modalRef = this.modalService.show(template);
  }
  likePost() {
    this.postService.likePost(this.post.id!).subscribe({
      next: (res) => {
        if (res.status === 201) {
          this.post.likes?.push(res.body!.newLike);
          this.countCommentsAndLikes();
          this.postLikedByCurrentUser = true;
        }
      },
      error: (error) => {
        console.log(error.error.message);
      },
    });
  }
  calcAvgMediaDimenisions() {
    let heightSum = 0;
    let widthSum = 0;
    this.post.media!.forEach((media) => {
      heightSum += media.dimensions!.height;
      widthSum += media.dimensions!.width;
    });
    this.avgMediaDimensions!.height = heightSum / this.post.media!.length!;
    this.avgMediaDimensions!.width = widthSum / this.post.media!.length!;
    console.log(this.avgMediaDimensions);
    
  }
}
