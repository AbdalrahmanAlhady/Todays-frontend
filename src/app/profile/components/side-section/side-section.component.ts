import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { Friendship } from 'src/app/shared/models/friendship.model';
import { Media } from 'src/app/shared/models/media.model';
import { User } from 'src/app/shared/models/user.model';
import { MediaUploadService } from 'src/app/shared/services/media-upload.service';
import { ShareDataService } from 'src/app/shared/services/share-data.service';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-side-section',
  templateUrl: './side-section.component.html',
  styleUrl: './side-section.component.css',
})
export class SideSectionComponent implements OnInit, OnDestroy {
  @ViewChild('showAllModal') showAllModal!: TemplateRef<void>;
  @Input() profileOwner!: User;
  @Input() title: string = '';
  @Input() sameUserProfile: boolean = false;
  media: Media[] = [];
  friends: Map<string, User> = new Map();
  friendships: Friendship[] = [];
  modalRef?: BsModalRef;
  currentMediaPage: number = 1;
  currentPostsPage: number = 1;
  currentFriendsPage: number = 1;
  subscriptions = new Subscription();

  constructor(
    private modalService: BsModalService,
    private mediaUploadService: MediaUploadService,
    private shareDataService: ShareDataService,
    private userService: UserService
  ) {}
  ngOnInit(): void {
    if (this.title === 'Media' && this.profileOwner) {
      this.getFirstPageOfMediaOfUser();
      this.listenToGetNextMediaPage();
      this.listenToNewProfileMedia();
    }
    if (this.title === 'Friends' && this.profileOwner) {
      this.getFirstPageOfFriendsOfUser();
      this.listenToGetNextFriendsPage();
    }
  }
  getFirstPageOfMediaOfUser() {
    this.subscriptions.add(
      this.mediaUploadService
        .getMediaOfUser(this.profileOwner.id!, '1', '6')
        .subscribe((res) => {
          this.media = res.body!.media.rows;
          console.log(this.media);
          this.currentMediaPage++;
          this.shareDataService.$noMoreProfileMediaPages.next(false);
        })
    );
  }
  getFirstPageOfFriendsOfUser() {
    this.subscriptions.add(
      this.userService
        .getUserFriends(this.profileOwner.id!, '1', '6')
        .subscribe((res) => {
          this.friendships = res.body!.friendships.rows;
          this.friendships.forEach((friendship) => {
            if (friendship.receiver !== this.profileOwner.id) {
              friendship.receiver = this.userService.spreadUserMedia(
                friendship.receiver!
              );
              this.friends.set(friendship.receiver?.id!, friendship.receiver!);
            } else {
              friendship.sender = this.userService.spreadUserMedia(
                friendship.sender!
              );
              this.friends.set(friendship.sender?.id!, friendship.sender!);
            }
          });
          this.currentFriendsPage++;
          this.shareDataService.$noMoreProfileFriendsPages.next(false);
        })
    );
  }
  showAllOf() {
    this.modalRef = this.modalService.show(this.showAllModal);
    if (this.title === 'Media') {
      this.shareDataService.$nextProfileMediaPage.next(true);
    } else if (this.title === 'Friends') {
      this.shareDataService.$nextProfileFriendsPage.next(true);
    }
  }

  listenToGetNextMediaPage() {
    this.shareDataService.$nextProfileMediaPage.subscribe((res) => {
      if (res) {
        this.subscriptions.add(
          this.mediaUploadService
            .getMediaOfUser(
              this.profileOwner.id!,
              this.currentMediaPage.toString(),
              '6'
            )
            .subscribe((res) => {
              this.media.push(...res.body?.media.rows!);
              if (res.body!.media.rows.length > 0) {
                this.currentMediaPage++;
              }
              this.shareDataService.$nextProfileMediaPage.next(false);
              if (this.media.length === res.body?.media.count) {
                this.shareDataService.$noMoreProfileMediaPages.next(true);
              }
            })
        );
      }
    });
  }
  listenToGetNextFriendsPage() {
    this.shareDataService.$nextProfileFriendsPage.subscribe((res) => {
      if (res) {
        this.subscriptions.add(
          this.userService
            .getUserFriends(
              this.profileOwner.id!,
              this.currentFriendsPage.toString(),
              '6'
            )
            .subscribe((res) => {
              this.friendships.push(...res.body!.friendships.rows);
              this.friendships.forEach((friendship) => {
                if (friendship.receiver!.id !== this.profileOwner.id) {
                  this.friends.set(
                    friendship.receiver?.id!,
                    this.userService.spreadUserMedia(friendship.receiver!)
                  );
                } else {
                  this.friends.set(friendship.sender?.id!, friendship.sender!);
                }
              });
              if (res.body!.friendships.rows.length > 0) {
                this.currentFriendsPage++;
              }
              this.shareDataService.$nextProfileFriendsPage.next(false);
              if (this.friendships.length === res.body?.friendships.count) {
                this.shareDataService.$noMoreProfileFriendsPages.next(true);
              }
              console.log(this.friendships);
            })
        );
      }
    });
  }
  getArrayOfFriends() {
    return Array.from(this.friends.values());
  }
  viewMedia(type: 'img' | 'video', url: string) {
    this.shareDataService.$viewMedia.next({ type, url });
  }
  deleteMedia(type: 'img' | 'video', id: string, url: string) {
    this.mediaUploadService.deleteMedia(id).subscribe({
      next: (res) => {
        if (res.message === 'deleted') {
          this.mediaUploadService.deleteMediafromFirebase(url).subscribe({
            next: (res) => {
              console.log(res);
              this.media = this.media.filter((media) => media.id !== id);
            },
            error: (err) => {
              console.log(err);
            },
          });
        }
      },
      error: (err) => {
        console.log(err);
      },
    });
  }
  listenToNewProfileMedia() {
    this.mediaUploadService.$profileMedia.subscribe((aMedia) => {
      if ((this.media && aMedia.current === false) || aMedia.current === null) {
        this.media.push(aMedia);
      }
    });
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
