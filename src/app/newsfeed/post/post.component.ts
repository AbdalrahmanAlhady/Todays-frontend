import {
  Component,
  ElementRef,
  Input, OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild
} from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from 'src/app/auth/auth.service';
import { Post } from 'src/app/shared/models/post.model';
import { CommentsService } from 'src/app/shared/services/comments.service';
import { PostsService } from 'src/app/shared/services/posts.service';
import { format } from 'timeago.js';
import { ShareDataService } from '../../shared/services/share-data.service';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit, OnDestroy {
  @Input() widthPercent!: number;
  @Input() post!: Post;
  @ViewChild('commentsModal') commentsModal!: TemplateRef<void>;
  @ViewChild('wait') wait!: ElementRef;
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
  subscriptions = new Subscription();

  constructor(
    private modalService: BsModalService,
    private postService: PostsService,
    private commentsService: CommentsService,
    private authService: AuthService,
    private render: Renderer2,
    private route: ActivatedRoute,
    private shareDataService: ShareDataService,
  ) {}

  ngOnInit(): void {
    // if not navigated to Component
    if (this.post) {
      this.preparePost();
    }
    // if navigated to Component
    this.subscriptions.add(
      this.route.params.subscribe((params) => {
        if (params['post_id']) {
          this.subscriptions.add(
            this.postService.getPostById(params['post_id']).subscribe((res) => {
              this.post = res.body?.post!;
              this.preparePost();
              this.route.fragment.subscribe((comment_id) => {
                if (this.post && this.post.comments?.length! > 0)
                  this.scrollToCommentById(comment_id!);
              });
            }),
          );
        }
      }),
    );
  }

  preparePost() {
    this.calculatePostDate();
    this.countCommentsAndLikes();
    this.checkIfPostLikedByCurrentUser();
    this.listenToNewComments();
    if (this.post.media) {
      this.calcAvgMediaDimenisions();
    }
  }

  calculatePostDate() {
    this.timeAgo = format(new Date(this.post.createdAt!));
  }

  checkIfPostLikedByCurrentUser() {
    this.postService.isLikedPost(this.post.id!).subscribe((res) => {
      this.postLikedByCurrentUser = res.body!.postLiked;
    });
  }

  listenToNewComments() {
    this.subscriptions.add(
      this.commentsService.$newComment.subscribe((comment) => {
        if (comment.post_id === this.post.id) {
          this.post.comments?.push(comment);
          this.countCommentsAndLikes();
        }
      }),
    );
  }

  countCommentsAndLikes() {
    this.commentsCount = this.post.comments!.length;
    this.likesCount = this.post.likes!.length;
  }

  openComments() {
    this.modalRef = this.modalService.show(this.commentsModal);
  }

  likeORUnlikePost() {
    if (this.postLikedByCurrentUser) {
      this.subscriptions.add(
        this.postService.unlikePost(this.post.id!).subscribe((res) => {
          this.post.likes = res.body?.newPostLikes!;
          this.countCommentsAndLikes();
          this.postLikedByCurrentUser = false;
          console.log(this.post.likes);
        }),
      );
    } else {
      this.subscriptions.add(
        this.postService.likePost(this.post.id!).subscribe({
          next: (res) => {
            if (res.status === 201) {
              this.post.likes?.push(res.body!.newLike);
              this.countCommentsAndLikes();
              this.postLikedByCurrentUser = true;
              console.log(this.post.likes);
            }
          },
          error: (error) => {
            console.log(error.error.message);
          },
        }),
      );
    }
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
  }

  scrollToCommentById(comment_id: string) {
    setTimeout(() => {
      this.openComments();
    }, 1);
    setTimeout(() => {
      this.shareDataService.$scrollToComment.next(comment_id);
    }, 1000);
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe()
  }
}
