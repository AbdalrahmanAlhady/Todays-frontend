import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { User } from '../shared/models/user.model';
import { PostsService } from '../shared/services/posts.service';
import { Post } from '../shared/models/post.model';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../shared/services/user.service';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
})
export class ProfileComponent implements OnInit {
  profileOwner!: User;
  posts: Post[] = [];
  viewerOwnerFriendshipStatus!: 'requested' | 'accepted' | 'none';
  subscriptions= new Subscription();

  constructor(
    private authService: AuthService,
    private postService: PostsService,
    private activateRoute: ActivatedRoute,
    private userService: UserService,
  ) {}

  ngOnInit(): void {
    this.activateRoute.params.subscribe((params) => {
      this.subscriptions.add(
      this.userService.getUser(params['user_id']).subscribe((res) => {
        this.profileOwner = res.body?.user!;
        this.getPostsOfProfileOwner();
        this.checkFriendshipStatus();
      }));
    });
  }

  getPostsOfProfileOwner() {
    this.subscriptions.add(
    this.postService.getPosts(this.profileOwner.id).subscribe((res) => {
      this.posts = res.body!.posts.rows;
    }));
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
      }));
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
        }));
    }
  }
}
