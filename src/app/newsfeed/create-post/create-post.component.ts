import { HttpEvent } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';
import { MediaUploadService } from 'src/app/shared/services/media-upload.service';
import { Media } from 'src/app/shared/models/media.model';
import { PostsService } from 'src/app/shared/services/posts.service';
import { Post } from 'src/app/shared/models/post.model';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css'],
})
export class CreatePostComponent {
  @ViewChild('post_body') postBody!: ElementRef;
  addImg: boolean = false;
  imgsToDisplay: File[] = [];
  imgsUrlsToDisplay: SafeUrl[] = [];
  showUploadedImg: boolean = false;
  imgCounter: number = 0;
  imgsArr: Media[] = [];
  post!: Post;
  ngOnInit() {}
  constructor(
    private mediaUploadService: MediaUploadService,
    private authService: AuthService,
    private postService: PostsService,
    private sanitizer: DomSanitizer
  ) {}
  onFileChanged(event: any) {
    const file = event.target!.files[0];
    this.imgsToDisplay.push(file);
    this.imgsUrlsToDisplay.push(
      this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file))
    );
    if (this.imgsUrlsToDisplay) {
      this.imgCounter++;
      this.showUploadedImg = true;
    }
  }
  cancelUploadingImg(index: number) {
    this.imgsUrlsToDisplay.splice(index, 1);
  }
  clear(){
    this.postBody.nativeElement.value = ''
    this.imgCounter=0;
    this.imgsToDisplay = [];
    this.imgsUrlsToDisplay=[];
    this.imgsArr=[];
    this.addImg=false;
  }
  createPost() {
    this.postService
      .createPost({
        body: this.postBody.nativeElement.value,
        owner_id: this.authService.getCurrentUserId(),
      })
      .subscribe({
        next: (res) => {
          this.post = res.body?.post!;
          const postId = res.body?.post.id;
          if ((res.status === 200 || 201) && postId) {
            this.imgsToDisplay.forEach((img, index) => {
              this.mediaUploadService.uploadImg(img, postId,  'post','img',index);
            });
          }
         
          this.mediaUploadService.$postImgsArr.subscribe((postImgsArr) => {
            if (this.imgCounter === postImgsArr.length) {
              this.post.media = postImgsArr;
              this.post.likes = [];
              this.post.comments =[];
              console.log(this.post.media);
              this.postService.$newPost.next(this.post)
              this.imgCounter = 0;
              this.mediaUploadService.$postImgsArr = new BehaviorSubject<Media[]>([]);
            }
          });
        },
        error: (err) => {
          console.log(err);
        },
      });
  }
}
