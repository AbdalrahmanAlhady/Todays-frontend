import {
  Component,
  ElementRef,
  Input,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { MediaUploadService } from 'src/app/shared/services/media-upload.service';
import { PostsService } from 'src/app/shared/services/posts.service';
import { Post } from 'src/app/shared/models/post.model';
import { UserService } from '../../shared/services/user.service';

@Component({
  selector: 'app-create-post',
  templateUrl: './create-post.component.html',
  styleUrls: ['./create-post.component.css'],
})
export class CreatePostComponent implements OnInit, OnDestroy {
  @ViewChild('post_body') postBody!: ElementRef;
  @Input() width!: number;
  addMedia: boolean = false;
  mediaToDisplay: File[] = [];
  mediaUrlsToDisplay: { displayUrl: SafeUrl; mediaType: 'video' | 'img' }[] =
    [];
  mediaLength: number = 0;
  mediaDimensions: {
    width: number;
    height: number;
  }[] = [];
  post!: Post;
  percentages: number[] = [];
  subscriptions = new Subscription();

  ngOnInit() {}

  constructor(
    private mediaUploadService: MediaUploadService,
    private postService: PostsService,
    private sanitizer: DomSanitizer,
    private userService: UserService,
  ) {}

  onFileChanged(event: any) {
    const mediaToDisplay: File = event.target!.files[0];
    const mediaType = mediaToDisplay.type.split('/')[0];
    this.mediaToDisplay.push(mediaToDisplay);
    this.mediaUrlsToDisplay.push({
      displayUrl: this.sanitizer.bypassSecurityTrustUrl(
        window.URL.createObjectURL(mediaToDisplay),
      ),
      mediaType: mediaType === 'video' ? 'video' : 'img',
    });
    // get width and height of imgs and videos
    this.getMediaDimensions(mediaToDisplay).then((dimensions) => {
      this.mediaDimensions.push(dimensions!);
    });
    this.mediaLength++;
  }

  cancelUploadingImg(index: number) {
    this.mediaUrlsToDisplay.splice(index, 1);
    this.mediaLength--;
  }

  clear() {
    setTimeout(() => {
      this.postBody.nativeElement.value = '';
      this.mediaLength = 0;
      this.mediaToDisplay = [];
      this.mediaUrlsToDisplay = [];
      this.addMedia = false;
      this.percentages = [];
      this.mediaDimensions = [];
    }, 1000);
  }

  createPost() {
    this.subscriptions.add(
      this.postService
        .createPost({
          body: this.postBody.nativeElement.value,
          owner_id: this.userService.getCurrentUserId(),
        })
        .subscribe({
          next: (res) => {
            this.post = res.body?.post!;
            if (this.post) {
              if (!this.mediaToDisplay || this.mediaToDisplay.length === 0) {
                this.initNewPost();
                this.clear();
              } else {
                this.mediaToDisplay.forEach((media, index) => {
                  this.subscriptions.add(
                    this.mediaUploadService
                      .uploadMedia(
                        media,
                        this.post.id!,
                        'post',
                        this.mediaUrlsToDisplay[index].mediaType,
                        this.mediaDimensions[index],
                        index,
                        this.mediaLength,
                      )
                      .subscribe((percent) => {
                        this.percentages[index] = Math.trunc(percent!);
                      })
                  );
                });
                this.attachUploadedMediaToPost();
              }
            }

          },
          error: (err) => {
            console.log(err);
          },
        }),
    );
  }

  attachUploadedMediaToPost() {
    this.subscriptions.add(
      this.mediaUploadService.$postMediaArr.subscribe((postMediaArr) => {
        if (this.mediaLength === postMediaArr.length) {
          this.post.media = postMediaArr;
          this.initNewPost();
          this.checkPercentagesAndClear();
        }
      }),
    );
  }

  initNewPost() {
    this.post.likes = [];
    this.post.comments = [];
    this.postService.$newPost.next(this.post);
  }

  checkPercentagesAndClear() {
    let uploadComplete = 0;
    this.percentages.forEach((percent) => {
      percent === 100 ? uploadComplete++ : uploadComplete ;
    });
    if (uploadComplete === this.percentages.length) {
      this.clear();
    }
  }

  async getMediaDimensions(
    file: File,
  ): Promise<{ width: number; height: number } | null> {
    return new Promise((resolve, reject) => {
      let media: HTMLImageElement | HTMLVideoElement;
      const reader = new FileReader();
      const fileType = file.type.split('/')[0] === 'video' ? 'video' : 'img';
      reader.onload = (event) => {
        if (fileType === 'img') {
          media = new Image();
          media.src = event.target!.result as string;
          media.onload = () => {
            resolve({
              width: (media as HTMLImageElement).naturalWidth,
              height: (media as HTMLImageElement).naturalHeight,
            });
          };
        } else {
          media = document.createElement('video');
          media.src = event.target!.result as string;
          media.onloadedmetadata = () => {
            resolve({
              width: (media as HTMLVideoElement).videoWidth,
              height: (media as HTMLVideoElement).videoHeight,
            });
          };
        }
      };
      reader.readAsDataURL(file);
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
