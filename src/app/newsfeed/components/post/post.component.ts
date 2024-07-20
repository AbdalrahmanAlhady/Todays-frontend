import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  Renderer2,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { AuthService } from 'src/app/shared/services/auth.service';
import { Post } from 'src/app/shared/models/post.model';
import { CommentsService } from 'src/app/shared/services/comments.service';
import { PostsService } from 'src/app/shared/services/posts.service';
import { format } from 'timeago.js';
import { ShareDataService } from '../../../shared/services/share-data.service';
import { Subject, Subscription } from 'rxjs';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css'],
})
export class PostComponent implements OnInit, OnDestroy {
  @Input() widthPercent!: number;
  @Input() post!: Post;
  @ViewChild('commentsModal') commentsModal!: TemplateRef<void>;
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
  currentCommentsPage: number = 1;
  $firstCommentsInit = new Subject<boolean>();

  constructor(
    private modalService: BsModalService,
    private postService: PostsService,
    private commentsService: CommentsService,
    private authService: AuthService,
    private render: Renderer2,
    private route: ActivatedRoute,
    private shareDataService: ShareDataService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    // if not navigated to Component
    if (this.post) {
      this.preparePost();
    } else {
      // if navigated to Component
      this.handleNavigationFromNotification();
    }
    this.listenToGetNextCommentsPage();
  }
  listenToGetNextCommentsPage() {
    this.subscriptions.add(
      this.shareDataService.$nextCommentsPage.subscribe((res) => {
        if (res) {
          this.subscriptions.add(
            this.commentsService
              .getComments(
                this.post.id!,
                this.currentCommentsPage.toString(),
                '4'
              )
              .subscribe((res) => {
                this.post.comments?.push(...res.body?.comments.rows!);
                this.currentCommentsPage++;
                this.shareDataService.$nextCommentsPage.next(false);
              })
          );
        }
      })
    );
  }
  getFirstCommentsPages() {
    this.subscriptions.add(
      this.commentsService
        .getComments(this.post.id!, '1', '4')
        .subscribe((res) => {
          this.post.comments = res.body?.comments.rows;
          if (this.post.comments?.length! > 0) {
            this.commentsCount = res.body?.comments.count!;
            this.currentCommentsPage++;
            this.$firstCommentsInit.next(true);
          }
        })
    );
  }

  preparePost() {
    this.getFirstCommentsPages();
    this.countLikes();
    this.calculatePostDate();
    this.checkIfPostLikedByCurrentUser();
    this.listenToNewComment();
    // handle user profile image
    this.post.user = this.userService.spreadUserMedia(this.post.user!);
    if (this.post.media) {
      this.calcAvgMediaDimenisions();
    }
  }

  calculatePostDate() {
    this.timeAgo = format(new Date(this.post.createdAt!));
  }

  checkIfPostLikedByCurrentUser() {
    this.subscriptions.add(
      this.postService.isLikedPost(this.post.id!).subscribe((res) => {
        this.postLikedByCurrentUser = res.body!.postLiked;
      })
    );
  }

  listenToNewComment() {
    this.subscriptions.add(
      this.commentsService.$newComment.subscribe((comment) => {
        if (comment.post_id === this.post.id) {
          this.post.comments?.push(comment);
          this.commentsCount++;
        }
      })
    );
  }

  countLikes() {
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
          this.countLikes();
          this.postLikedByCurrentUser = false;
        })
      );
    } else {
      this.subscriptions.add(
        this.postService.likePost(this.post.id!).subscribe({
          next: (res) => {
            if (res.status === 201) {
              this.post.likes?.push(res.body!.newLike);
              this.countLikes();
              this.postLikedByCurrentUser = true;
            }
          },
          error: (error) => {
            console.log(error.error.message);
          },
        })
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
  handleNavigationFromNotification() {
    this.subscriptions.add(
      this.route.params.subscribe((params) => {
        if (params['post_id']) {
          this.subscriptions.add(
            this.postService
              .getPosts(undefined, undefined, undefined, params['post_id'])
              .subscribe((res) => {
                this.post = res.body?.posts.rows[0]!;
                this.preparePost();
                this.subscriptions.add(
                  this.$firstCommentsInit.subscribe((res) => {
                    if (res && this.post.comments) {
                      this.route.fragment.subscribe((comment_id) => {
                        this.scrollToCommentById(comment_id!);
                        this.$firstCommentsInit.next(false);
                      });
                    }
                  })
                );
              })
          );
        }
      })
    );
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
    this.subscriptions.unsubscribe();
  }
}
