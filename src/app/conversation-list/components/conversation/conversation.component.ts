import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { AuthService } from '../../../auth/services/auth.service';
import { Subscription } from 'rxjs';
import { SocketService } from '../../../shared/services/socket.service';
import { Message } from '../../../shared/models/message.model';
import { MessageService } from '../../../shared/services/message.service';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/models/user.model';
import { Conversation } from 'src/app/shared/models/conversation.model';
import { ConversationService } from 'src/app/shared/services/conversation.service';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.css',
})
export class ConversationComponent implements OnInit, OnDestroy {
  @Input() conversation!: Conversation;
  socket!: Socket;
  socketConnectionData!: Socket<DefaultEventsMap, DefaultEventsMap>;
  currentUser!: User;
  otherUser!: User;
  isAuth: boolean = false;
  subscriptions = new Subscription();
  messages: Message[] = [];
  newMessage: Message = {
    body: '',
    seen: false,
    conversation_id: '',
    sender_id: this.userService.getCurrentUserId(),
    receiver_id: '',
  };
  conversationStatusOfCurrentUser: 'minimzed' | 'closed' | 'active' = 'active';
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private socketService: SocketService,
    private messageService: MessageService,
    private conversationService: ConversationService
  ) {}
  ngOnInit(): void {
    this.getCurrentUser();
    this.getMessagesOfConversation();
    this.determineOtherUser();
    this.messageService.$newMessageToConversation.subscribe((message) => {
      this.receiveNewMessage(message);
    });
  }
  getCurrentUser() {
    this.subscriptions.add(
      this.userService
        .getUser(this.userService.getCurrentUserId())
        .subscribe((res) => {
          this.currentUser = this.userService.spreadUserMedia(
            res.body!.user
          );
        })
    );
    this.isAuth = this.authService.isUserAuthorized();
  }

  getMessagesOfConversation() {
    this.messageService
      .getMessagesOfConversation(this.conversation.id!)
      .subscribe((res) => {
        this.messages = res.body!.messages.rows;
      });
  }
  sendMessage() {
    this.newMessage.conversation_id = this.conversation.id!;
    this.messageService.sendMessage(this.newMessage).subscribe((res) => {
      this.messages.push(res.body!.message);
    });
    this.newMessage.body = '';
  }
  determineOtherUser() {
    console.log('convo', this.conversation);
    this.otherUser =
      this.conversation.first_user!.id === this.userService.getCurrentUserId()
        ? this.conversation.second_user!
        : this.conversation.first_user!;
    this.newMessage.receiver_id = this.otherUser.id!;
  }
  receiveNewMessage(message: Message) {
    this.messages.push(message);
  }
  seenMessages() {
    this.messages.forEach((message) => {
      if (message.sender_id !== this.currentUser.id && message.seen === false) {
        this.messageService.seenMessages(message.id!).subscribe((res) => {
          if (res.body?.message === 'updated') {
            message.seen = true;
          }
        });
      }
    });
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.changeConversationStatus('closed');
  }
  changeConversationStatus(action: 'minimzed' | 'closed' | 'active') {
    let first_user_status = this.conversation.first_user_status;
    let second_user_status = this.conversation.second_user_status;
    if (
      this.conversation.first_user_id === this.userService.getCurrentUserId()
    ) {
      first_user_status = action;
    } else {
      second_user_status = action;
    }
    this.conversationStatusOfCurrentUser = action;

    this.conversationService
      .updateConversation(
        this.conversation.id!,
        first_user_status,
        second_user_status
      )
      .subscribe((res) => {
        if (res.body?.message === 'updated') {
          this.conversation.first_user_status = first_user_status;
          this.conversation.second_user_status = second_user_status;
          if (action === 'closed') {
            this.conversationService.$closeConversation.next(
              this.conversation.id!
            );
          }
        }
      });
  }
}
