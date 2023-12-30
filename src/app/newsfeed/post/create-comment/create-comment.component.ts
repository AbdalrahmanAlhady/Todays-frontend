import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { AuthService } from 'src/app/auth/auth.service';
import { Comment } from 'src/app/shared/models/comment.model';
import { Media } from 'src/app/shared/models/media.model';
import { CommentsService } from 'src/app/shared/services/comments.service';
import { MediaUploadService } from 'src/app/shared/services/media-upload.service';
import { PostsService } from 'src/app/shared/services/posts.service';

@Component({
  selector: 'app-create-comment',
  templateUrl: './create-comment.component.html',
  styleUrl: './create-comment.component.css',
})
export class CreateCommentComponent {
  @ViewChild('comment_body') commentBody!: ElementRef;
  @Input() post_id: string = '';
  addImg: boolean = false;
  imgToDisplay?: File;
  imgUrlToDisplay!: SafeUrl;
  showedUploadedImg: boolean = false;
  comment!: Comment;
  percentage!: number;
  ngOnInit() {}
  constructor(
    private mediaUploadService: MediaUploadService,
    private authService: AuthService,
    private commentsService: CommentsService,
    private sanitizer: DomSanitizer
  ) {}
  onFileChanged(event: any) {
    this.imgToDisplay = event.target!.files[0];
    this.imgUrlToDisplay = this.sanitizer.bypassSecurityTrustUrl(
      window.URL.createObjectURL(this.imgToDisplay!)
    );
    if (this.imgUrlToDisplay) {
      this.showedUploadedImg = true;
    }
  }
  cancelUploadingImg(file: File) {
    this.imgToDisplay = undefined;
    this.imgUrlToDisplay = '';
  }
  createComment() {
    this.commentsService
      .createComment({
        body: this.commentBody.nativeElement.value,
        owner_id: this.authService.getCurrentUserId(),
        post_id: this.post_id,
      })
      .subscribe({
        next: (res) => {
          const commentId = res.body?.comment.id;
          this.comment = res.body?.comment!;
          if ((res.status === 200 || 201) && commentId) {
            if (this.imgToDisplay) {
                this.mediaUploadService
              .uploadImg(this.imgToDisplay!, commentId, 'comment', 'img', 0)
              .subscribe((percent) => {
                this.percentage = percent!;
              });

            }
          }
          if (!this.imgToDisplay) {
            this.commentsService.$newComment.next(this.comment);
            setTimeout(() => {
              this.clear();
            }, 2000);
          }
          this.mediaUploadService.$commentImg.subscribe((media) => {
            this.comment.media = media;
            this.commentsService.$newComment.next(this.comment);
            if (this.percentage === 100) {
              setTimeout(() => {
                this.clear();
              }, 2000);
            }
          });
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
  clear() {
    this.commentBody.nativeElement.value = '';
    this.imgToDisplay = undefined;
    this.imgUrlToDisplay = '';
    this.addImg = false;
    this.percentage = NaN;
  }
}
