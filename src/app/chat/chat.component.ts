import { Component, OnInit } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { AuthService } from '../auth/auth.service';
import { User } from '../shared/models/user.model';
import {UserService} from "../shared/services/user.service";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.css',
})
export class ChatComponent implements OnInit {
  socket!: Socket;
  socketConnectionData!: Socket<DefaultEventsMap, DefaultEventsMap>;
  onlineUserList: User[] = [];

  constructor(private authService: AuthService,private userService:UserService) {}
  ngOnInit(): void {}
  connect() {
    this.socket = io('ws://localhost:3000');
  }
  setName() {
    this.socketConnectionData = this.socket.emit(
      'set-userID',
      this.userService.getCurrentUserId()
    );
    this.socket.on('online-user-list', (onlineUserList: User[]) => {
      this.onlineUserList = onlineUserList;
      console.log(this.onlineUserList);

    });
  }
}
