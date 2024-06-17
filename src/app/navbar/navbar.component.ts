import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { User } from '../shared/models/user.model';
import { Notification } from '../shared/models/notification.model';
import { Router } from '@angular/router';
import { UserService } from '../shared/services/user.service';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { NotificationService } from '../shared/services/notification.service';
import { Subscription } from 'rxjs';
import { user } from '@angular/fire/auth';
import { SocketService } from '../shared/services/socket.service';

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
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    this.isAuthorized();
    this.getUserNotification();
    this.socketService.connectToSockets();
    this.listenToNotification();
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
        })
    );
    this.isAuth = this.authService.isUserAuthorized();
  }


  listenToNotification() {
    this.socketService.socket.on('notify', (notification: Notification) => {
      this.notifications.push(notification);
      this.unseenNotificationsCount++;
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
        })
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
