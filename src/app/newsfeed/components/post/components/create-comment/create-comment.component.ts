import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Comment } from 'src/app/shared/models/comment.model';
import { CommentsService } from 'src/app/shared/services/comments.service';
import { MediaUploadService } from 'src/app/shared/services/media-upload.service';

import { Subscription } from 'rxjs';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-create-comment',
  templateUrl: './create-comment.component.html',
  styleUrl: './create-comment.component.css',
})
export class CreateCommentComponent implements OnInit, OnDestroy {
  @ViewChild('comment_body') commentBody!: ElementRef;
  @Input() post_id: string = '';
  mediaToDisplay?: File;
  mediaUrlToDisplay: {
    displayUrl: SafeUrl | null;
    fileType: 'video' | 'img' | '';
  } = { displayUrl: null, fileType: '' };
  comment!: Comment;
  percentage!: number;
  subscriptions = new Subscription();

  ngOnInit() {}

  constructor(
    private mediaUploadService: MediaUploadService,
    private commentsService: CommentsService,
    private sanitizer: DomSanitizer,
    private userService: UserService,
  ) {}

  onFileChanged(event: any) {
    this.mediaToDisplay = event.target!.files[0];
    const fileType = this.mediaToDisplay!.type.split('/')[0];
    this.mediaUrlToDisplay!.displayUrl = this.sanitizer.bypassSecurityTrustUrl(
      window.URL.createObjectURL(this.mediaToDisplay!),
    );
    this.mediaUrlToDisplay!.fileType = fileType === 'video' ? 'video' : 'img';
  }

  createComment() {
    this.subscriptions.add(
      this.commentsService
        .createComment({
          body: this.commentBody.nativeElement.value,
          owner_id: this.userService.getCurrentUserId(),
          post_id: this.post_id,
        })
        .subscribe({
          next: (res) => {
            this.comment = res.body?.comment!;
            if (this.comment) {
              if (this.mediaToDisplay) {
                this.subscriptions.add(
                  this.mediaUploadService
                    .uploadMedia(
                      this.mediaToDisplay!,
                      this.comment.id!,
                      'comment',
                      this.mediaUrlToDisplay.fileType === 'img'
                        ? 'img'
                        : 'video',
                    )
                    .subscribe((percent) => {
                      this.percentage = Math.trunc(percent!);
                    }),
                );
                this.attachUploadedMediaToComment();
              } else {
                this.commentsService.$newComment.next(this.comment);
                setTimeout(() => {
                  this.clear();
                }, 1000);
              }
            }
          },
          error: (err) => {
            console.log(err);
          },
        }),
    );
  }

  attachUploadedMediaToComment() {
    this.subscriptions.add(
      this.mediaUploadService.$commentMedia.subscribe((media) => {
        this.comment.media = media;
        this.commentsService.$newComment.next(this.comment);
        if (this.percentage === 100) {
          this.clear();
        }
      }),
    );
  }

  clear() {
    setTimeout(() => {
      this.commentBody.nativeElement.value = '';
      this.mediaToDisplay = undefined;
      this.mediaUrlToDisplay = { displayUrl: null, fileType: '' };
      this.percentage = NaN;
    }, 2000);
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
