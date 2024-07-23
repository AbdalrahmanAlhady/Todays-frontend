import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { BehaviorSubject, Subject } from 'rxjs';
import { de } from 'timeago.js/lib/lang';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  socket!: Socket;
  socketConnectionData!: Socket<DefaultEventsMap, DefaultEventsMap>;
  $onlineFriendsList = new Subject<User[]>();
  $socketConnected = new BehaviorSubject<boolean>(false);
  constructor(private userService: UserService, private router: Router) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (
          event.url === '/signup' ||
          event.url === '/signin' ||
          event.url === ''
        ) {
          return;
        } else {
          this.connectToSockets();
        }
      }
    });
  }
  connectToSockets() {
    if (!this.$socketConnected.getValue()) {
      this.socket = io('ws://localhost:3000');
      console.log('socket connected');
      this.$socketConnected.next(true);
      this.socketConnectionData = this.socket.emit(
        'set-userID',
        this.userService.getCurrentUserId()
      );
    }
  }
  ListenToOnlineFriends() {
    this.socket.on('online-friends-list', (onlineFriendsList: User[]) => {
      this.$onlineFriendsList.next(onlineFriendsList);
    });
  }
  getOnlineFriends() {
    this.socketConnectionData.emit(
      'get-online-friends',
      this.userService.getCurrentUserId()
    );
  }
  disconnect() {
    this.socket.disconnect();
  }
}
