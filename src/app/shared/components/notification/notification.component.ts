import {Component, Input, OnDestroy, OnInit} from '@angular/core';
import { User } from '../../models/user.model';
import { Notification } from '../../models/notification.model';
import { Router } from '@angular/router';
import { NotificationService } from '../../services/notification.service';
import { UserService } from '../../services/user.service';
import {Subscription} from "rxjs";

@Component({
  selector: 'app-notification',
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
})
export class NotificationComponent implements OnInit, OnDestroy {
  @Input() notification!: Notification;
  sender!: User;
  subscriptions= new Subscription();
  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private userService: UserService,
  ) {}
  ngOnInit() {
    this.sender = this.notification.sender!;
  }

  toProfile() {
    this.router.navigate(['/profile', this.sender.id]);
  }
  goToComment() {
    this.router.navigate(['/post', this.notification.post_id], {
      fragment: this.notification.comment_id,
    });
  }
  goToPost() {
    this.router.navigate(['/post', this.notification.post_id]);
  }
  acceptFriendship() {
    this.subscriptions.add(
      this.userService
        .acceptFriendRequest(
          this.notification.sender_id,
          this.notification.receiver_id,
        )
        .subscribe((res) => {}),
    );
  }
  declineFriendship() {
    this.subscriptions.add(
      this.userService
        .declineFriendRequest(
          this.notification.sender_id,
          this.notification.receiver_id,
        )
        .subscribe((res) => {}),
    );
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
