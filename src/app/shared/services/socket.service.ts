import { Injectable } from '@angular/core';
import { Socket, io } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { UserService } from './user.service';
import { User } from '../models/user.model';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  socket!: Socket;
  socketConnectionData!: Socket<DefaultEventsMap, DefaultEventsMap>;
  $onlineFriendsList= new Subject<User[]>();
  
  constructor(private userService: UserService) { }
  connectToSockets() {
    if (!this.socket || !this.socket.connected) {
      this.socket = io('ws://localhost:3000');
      console.log('socket connected');
      this.socketConnectionData = this.socket.emit(
        'set-userID',
        this.userService.getCurrentUserId(),
      );

    }
  }
  ListenToOnlineFriends() {
    this.socketConnectionData.on(
      'online-friends-list',
      (onlineFriendsList: User[]) => {
        this.$onlineFriendsList.next(onlineFriendsList);
        console.log('online friends', onlineFriendsList);
        
      }
    );
  }
}
