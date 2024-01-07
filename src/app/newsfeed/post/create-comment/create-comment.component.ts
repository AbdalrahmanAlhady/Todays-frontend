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
  mediaToDisplay?: File;
  mediaUrlToDisplay: {
    displayUrl: SafeUrl | null;
    fileType: 'video' | 'img' | '';
  } = { displayUrl: null, fileType: '' };
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
    this.mediaToDisplay = event.target!.files[0];
    const fileType = this.mediaToDisplay!.type.split('/')[0];
    this.mediaUrlToDisplay!.displayUrl = this.sanitizer.bypassSecurityTrustUrl(
      window.URL.createObjectURL(this.mediaToDisplay!)
    );
    this.mediaUrlToDisplay!.fileType = fileType === 'video' ? 'video' : 'img';
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
          this.comment = res.body?.comment!;
          if ((res.status === 200 || 201) && this.comment.id) {
            if (this.mediaToDisplay) {
              this.mediaUploadService
                .uploadMedia(
                  this.mediaToDisplay!,
                  this.comment.id,
                  'comment',
                  this.mediaUrlToDisplay.fileType === 'img' ? 'img' : 'video',
                  0
                )
                .subscribe((percent) => {
                  this.percentage = Math.trunc(percent!);
                });
            }
          }
          if (!this.mediaToDisplay) {
            this.commentsService.$newComment.next(this.comment);
            setTimeout(() => {
              this.clear();
            }, 2000);
          }
          this.mediaUploadService.$commentMedia.subscribe((media) => {
            this.comment.media = media;
            this.commentsService.$newComment.next(this.comment);
            if (this.percentage === 100) {
              this.clear();
            }
          });
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
  clear() {
    setTimeout(() => {
      this.commentBody.nativeElement.value = '';
      this.mediaToDisplay = undefined;
      this.mediaUrlToDisplay = { displayUrl: null, fileType: '' };
      this.percentage = NaN;
    }, 2000);
  }
}
