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
  imgToBeUploaded?: File;
  imgUrlToBeUploaded!: SafeUrl;
  showedUploadedImg: boolean = false;
  imgsArr: Media[] = [];
  comment!: Comment;
  ngOnInit() {}
  constructor(
    private mediaUploadService: MediaUploadService,
    private authService: AuthService,
    private commentsService: CommentsService,
    private sanitizer: DomSanitizer
  ) {}
  onFileChanged(event: any) {
    this.imgToBeUploaded = event.target!.files[0];
    this.imgUrlToBeUploaded = this.sanitizer.bypassSecurityTrustUrl(
      window.URL.createObjectURL(this.imgToBeUploaded!)
    );
    if (this.imgUrlToBeUploaded) {
      this.showedUploadedImg = true;
    }
  }
  cancelUploadingImg(file: File) {
    this.imgToBeUploaded = undefined;
    this.imgUrlToBeUploaded = '';
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
            this.mediaUploadService.uploadImg(
              this.imgToBeUploaded!,
              commentId,
              'comment',
              'img',
              0
            );
          }
          this.mediaUploadService.$commentImg.subscribe((media) => {
            this.comment.media = media;
            this.commentsService.$newComment.next(this.comment);
            console.log(this.comment);
          });
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
}
