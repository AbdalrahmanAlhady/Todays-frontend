import { HttpEvent } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { MediaUploadService } from 'src/app/shared/media-upload.service';
import { Media } from 'src/app/shared/media.model';
import { PostsService } from 'src/app/shared/posts.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css'],
})
export class CreatePostComponent {
  @ViewChild('post_body') postBody!: ElementRef;
  addImg: boolean = false;
  imgToBeUploaded: File[] = [];
  imgUrlToBeUploaded: SafeUrl[] = [];
  showedUploadedImg: boolean = false;
  imgCounter: number = 0;
  imgsArr: Media[] = [];
  ngOnInit() {}
  constructor(
    private mediaUploadService: MediaUploadService,
    private authService: AuthService,
    private postService: PostsService,
    private sanitizer: DomSanitizer
  ) {}
  onFileChanged(event: any) {
    console.log(event.target!.files);

    const file = event.target!.files[0];
    this.imgToBeUploaded.push(file);
    this.imgUrlToBeUploaded.push(
      this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file))
    );
    if (this.imgUrlToBeUploaded) {
      this.imgCounter++;
      this.showedUploadedImg = true;
    }
  }
  cancelUploadingImg(index: number) {
    this.imgUrlToBeUploaded.splice(index, 1);
  }
  createPost() {
    this.postService
      .createPost({
        body: this.postBody.nativeElement.value,
        owner_id: this.authService.getUserId(),
      })
      .subscribe({
        next: (res) => {
          const postId = res.body?.post.id;
          if ((res.status === 200 || 201) && postId) {
            this.imgToBeUploaded.forEach((img,index) => {
              this.mediaUploadService.uploadImg(img, postId,index);
            });
          }
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
}
