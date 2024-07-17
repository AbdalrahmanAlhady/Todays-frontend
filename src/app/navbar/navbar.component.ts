import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/services/auth.service';
import { User } from '../shared/models/user.model';
import { Notification } from '../shared/models/notification.model';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { UserService } from '../shared/services/user.service';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { NotificationService } from '../shared/services/notification.service';
import { Subscription } from 'rxjs';
import { user } from '@angular/fire/auth';
import { SocketService } from '../shared/services/socket.service';
import { LocalStorageService } from '../shared/services/local-storage.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
})
export class NavbarComponent implements OnInit, OnDestroy {
  user!: User;
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
    private socketService: SocketService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (
          event.url === '/signup' ||
          event.url === '/signin' ||
          event.url === ''
        ) {
          return;
        } else {
          if (!this.user) {
            this.user = this.userService.spreadUserMedia(
              this.localStorageService.getItem('user')
            );
            this.listenToNotification();
            this.getUserNotification();
          }
        }
      }
    });
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
          console.log(this.notifications);
          
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
        this.subscriptions.add(
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
        }));
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
