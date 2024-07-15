import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { User } from '../shared/models/user.model';
import { Notification } from '../shared/models/notification.model';
import { ActivatedRoute, Router } from '@angular/router';
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
    private route: ActivatedRoute,
    private userService: UserService,
    private notificationService: NotificationService,
    private socketService: SocketService
  ) {}

  ngOnInit(): void {
    if (
      this.router.url !== '/signin' &&
      this.router.url !== '/signup' &&
      this.router.url !== '/' &&
      !this.isAuth
    ) {
      this.getCurrentUser();
    }
  }

  ngDoCheck(): void {
    if (
      !this.isAuth &&
      this.router.url !== '/signin' &&
      this.router.url !== '/signup' &&
      this.router.url !== '/'
    ) {
      this.getCurrentUser();
    }
  }

  getCurrentUser() {
    this.subscriptions.add(
      this.userService
        .getUser(this.userService.getCurrentUserId())
        .subscribe((res) => {
          this.user = this.userService.spreadUserMedia(res.body!.user);
          this.isAuth = this.authService.isUserAuthorized();
          if (this.isAuth) {
            if (!this.socketService.$socketConnected.getValue()) {
              this.socketService.connectToSockets();
            }
            this.getUserNotification();
            this.listenToNotification();
          }
        })
    );
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
  seenNotification() {
    if (this.unseenNotificationsCount > 0) {
      this.notifications.forEach((notification) => {
        this.notificationService.seenNotification(notification.id!).subscribe({
          next: (res) => {
            if (res.body?.message === 'notification updated') {
              notification.seen = true;
              this.unseenNotificationsCount--;
            }
          },
          error: (err) => {
            console.log(err);
          },
        });
      });
    }
  }
  signout() {
    this.authService.signout();
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
