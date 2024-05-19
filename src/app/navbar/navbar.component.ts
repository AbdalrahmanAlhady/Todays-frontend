import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { User } from '../shared/models/user.model';
import { Notification } from '../shared/models/notification.model';
import { Router } from '@angular/router';
import { UserService } from '../shared/services/user.service';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { NotificationService } from '../shared/services/notification.service';
import { Subscription } from 'rxjs';
import {user} from "@angular/fire/auth";

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  user!: User;
  isAuth: boolean = false;
  socket!: Socket;
  socketConnectionData!: Socket<DefaultEventsMap, DefaultEventsMap>;
  notifications: Notification[] = [];
  unseenNotificationsCount: number = 0;
  subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.isAuthorized();
    this.getUserNotification();
    this.connectToSockets();
    this.listenToNotification();
    console.log(this.userService.getCurrentUserId())
  }

  ngDoCheck(): void {
    if (!this.isAuth) {
      this.isAuthorized();
    }
  }

  isAuthorized() {
    this.subscriptions.add(
      this.userService
        .getUser(this.userService.getCurrentUserId())
        .subscribe((res) => {
          this.user = res.body!.user;
          console.log(this.user)
        })
    );
    this.isAuth = this.authService.isUserAuthorized();
  }

  toProfile(user: User) {
    this.router.navigate(['/profile', user.id]);
  }

  connectToSockets() {
    if (!this.socket || !this.socket.connected) {
      this.socket = io('ws://localhost:3000');
      console.log('socket connected');
      this.socketConnectionData = this.socket.emit(
        'set-userID',
        this.userService.getCurrentUserId(),
      );
      this.socket.on('online-user-list', (onlineUserList: User[]) => {});
    }
  }

  listenToNotification() {
    this.socket.on('notify', (notification: Notification) => {
      this.notifications.push(notification);
      this.notifications = [...this.notifications];
      this.unseenNotificationsCount++;
      console.log(this.notifications);
    });
  }

  trackByFn(idx: number, item: any) {
    return item.id;
  }

  getUserNotification() {
    this.subscriptions.add(
      this.notificationService
        .getUserNotification(this.userService.getCurrentUserId())
        .subscribe((res) => {
          this.notifications = res.body!.notifications!.rows!;
          this.countUnseenNotifications();
        }),
    );
  }

  countUnseenNotifications() {
    this.notifications.forEach((notification) => {
      !notification.seen
        ? this.unseenNotificationsCount++
        : this.unseenNotificationsCount;
    });
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
