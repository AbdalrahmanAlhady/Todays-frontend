import {
  Component,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
import { User } from '../shared/models/user.model';
import { PostsService } from '../shared/services/posts.service';
import { Post } from '../shared/models/post.model';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../shared/services/user.service';
import { Subscription } from 'rxjs';
import { MediaUploadService } from '../shared/services/media-upload.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { ShareDataService } from '../shared/services/share-data.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit, OnDestroy {
  profileOwner!: User;
  posts: Post[] = [];
  viewerOwnerFriendshipStatus!: 'requested' | 'accepted' | 'none';
  subscriptions = new Subscription();
  sameUser!: boolean;
  currentPostsPage: number = 1;
  editingPersonalInfo: boolean = false;
  mediaToDisplay?: File;
  mediaUrlToDisplay: {
    displayUrl: SafeUrl | null;
    fileType: 'video' | 'img' | '';
  } = { displayUrl: null, fileType: '' };
  percentage!: number;
  uploadMode: boolean = false;
  forObj!: 'profile' | 'cover';
  uploadIndex: number = 0;
  loading: boolean = false;
  viewedImgUrl!: string;
  viewedVideoUrl!: string;
  constructor(
    private postService: PostsService,
    private activateRoute: ActivatedRoute,
    private userService: UserService,
    private postsService: PostsService,
    private mediaService: MediaUploadService,
    private sanitizer: DomSanitizer,
    private shareDataService: ShareDataService
  ) {}

  ngOnInit(): void {
    this.activateRoute.params.subscribe((params) => {
      this.subscriptions.add(
        this.userService.getUser(params['user_id']).subscribe((res) => {
          this.profileOwner = this.userService.spreadUserMedia(res.body!.user);
          this.sameUser =
            this.profileOwner.id === this.userService.getCurrentUserId();
            console.log(this.sameUser);
            
          this.getFirstPageOfPostsOfProfileOwner();
          this.checkFriendshipStatus(); 
          this.listenToNewUserPosts();
          this.listenToViewMedia();
        })
      );
    });
  }
  listenToViewMedia() {
    this.subscriptions.add(
    this.shareDataService.$viewMedia.subscribe((res) => {
      if (res.type === 'img') {
        this.viewedImgUrl = res.url;
      } else if (res.type === 'video') {
        this.viewedVideoUrl = res.url;
      }
    }));
  }
  viewMedia(type: 'img' | 'video', url: string) {
    this.shareDataService.$viewMedia.next({ type, url });
  }
  getFirstPageOfPostsOfProfileOwner() {
    this.subscriptions.add(
      this.postService
        .getPosts(this.profileOwner.id, '1', '3')
        .subscribe((res) => {
          this.posts = res.body!.posts.rows;
          this.currentPostsPage++;
        })
    );
  }
  getNextPostsPage() {
    this.subscriptions.add(
      this.postsService
        .getPosts(this.profileOwner?.id, this.currentPostsPage.toString(), '3')
        .subscribe((res) => {
          this.posts.push(...res.body?.posts.rows!);
          this.currentPostsPage++;
        })
    );
  }
  checkFriendshipStatus() {
    this.subscriptions.add(
      this.userService
        .checkFriendshipStatus(
          this.userService.getCurrentUserId(),
          this.profileOwner.id!
        )
        .subscribe((res) => {
          this.viewerOwnerFriendshipStatus = res.body?.friendship_status!;
        })
    );
  }
  sendFriendRequest() {
    if (this.viewerOwnerFriendshipStatus === 'none') {
      this.subscriptions.add(
        this.userService
          .sendFriendRequest(
            this.userService.getCurrentUserId(),
            this.profileOwner.id!
          )
          .subscribe((res) => {
            if (res.body?.message === 'sent') {
              this.viewerOwnerFriendshipStatus = 'requested';
            }
          })
      );
    }
  }
  listenToNewUserPosts() {
    this.subscriptions.add(
      this.postsService.$newPost.subscribe((post) => {
        if (post.owner_id === this.profileOwner.id) this.posts.push(post);
      })
    );
  }

  onFileChanged(event: any, type: 'profile' | 'cover') {
    this.forObj = type;
    this.uploadMode = true;
    this.mediaToDisplay = event.target!.files[0];
    this.mediaUrlToDisplay!.displayUrl = this.sanitizer.bypassSecurityTrustUrl(
      window.URL.createObjectURL(this.mediaToDisplay!)
    );
    this.mediaUrlToDisplay!.fileType = 'img';
  }
  uploadMedia() {
    this.getUploadIndexOfProfileCoverOrImage().subscribe((res) => {
      let length = res.body?.media.rows!.length;
      this.uploadIndex = length && length > 0 ? length : 0;

      this.mediaService
        .uploadMedia(
          this.mediaToDisplay!,
          null,
          'img',
          this.forObj,
          undefined,
          this.uploadIndex,
          undefined
        )
        .subscribe((percent) => {
          this.percentage = Math.trunc(percent!);
          this.loading = true;
          if (percent === 100) {
            setTimeout(() => {
              this.loading = false;
              this.uploadMode = false;
            }, 1000);
          }
        });
    });
  }
  cancelUpload() {
    window.location.reload();
  }
  getUploadIndexOfProfileCoverOrImage() {
    return this.mediaService.getMediaOfUser(
      this.profileOwner.id!,
      undefined,
      undefined,
      this.forObj
    );
  }
  cancelView() {
    this.viewedImgUrl = '';
    this.viewedVideoUrl = '';
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
