import { Component, DoCheck, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../shared/services/auth.service';
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
import { ShareDataService } from '../shared/services/share-data.service';

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
  currentPage: number = 1;
  constructor(
    private authService: AuthService,
    private router: Router,
    private userService: UserService,
    private notificationService: NotificationService,
    private socketService: SocketService,
    private localStorageService: LocalStorageService,
    private shareDataService: ShareDataService
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
            this.shareDataService.$deleteNotification.subscribe((id) => {
              this.notifications = this.notifications.filter(
                (notification) => notification.id !== id
              );
            });
          }
        }
      }
    });
  }

  listenToNotification() {
    this.socketService.socket.on('notify', (notification: Notification) => {
      this.notifications.unshift(notification);
      this.unseenNotificationsCount++;
    });
  }

  trackByFn(idx: number, item: any) {
    return item.id;
  }
  getUserNotification() {
    this.subscriptions.add(
      this.notificationService
        .getUserNotification(
          this.userService.getCurrentUserId(),
          this.currentPage + '',
          '5'
        )
        .subscribe((res) => {
          if (this.notifications.length === 0) {
            this.notifications = res.body!.notifications!.rows!;
          } else {
            this.notifications.push(...res.body!.notifications!.rows!);
          }
          this.currentPage++;
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
          this.notificationService
            .seenNotification(notification.id!)
            .subscribe({
              next: (res) => {
                if (res.body?.message === 'notification updated') {
                  notification.seen = true;
                  if (this.unseenNotificationsCount > 0)
                    this.unseenNotificationsCount--;
                }
              },
              error: (err) => {
                console.log(err);
              },
            })
        );
      });
    }
  }
  goToProfile(id: string) {
    this.router.navigate(['/profile', id]);
    if (this.router.url.includes('/profile/')) {
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }
  }
  signout() {
    this.socketService.disconnect();
    this.authService.signout(this.user.id!);
  }
  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }
}
