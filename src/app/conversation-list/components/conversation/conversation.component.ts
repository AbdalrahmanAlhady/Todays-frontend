import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { Socket } from 'socket.io-client';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { AuthService } from '../../../shared/services/auth.service';
import { count, Subscription } from 'rxjs';
import { SocketService } from '../../../shared/services/socket.service';
import { Message } from '../../../shared/models/message.model';
import { MessageService } from '../../../shared/services/message.service';
import { UserService } from '../../../shared/services/user.service';
import { User } from '../../../shared/models/user.model';
import { Conversation } from 'src/app/shared/models/conversation.model';
import { ConversationService } from 'src/app/shared/services/conversation.service';
import { ShareDataService } from 'src/app/shared/services/share-data.service';
import { ScrollDirective } from 'src/app/shared/directives/scroll.directive';
import { LocalStorageService } from 'src/app/shared/services/local-storage.service';

@Component({
  selector: 'app-conversation',
  templateUrl: './conversation.component.html',
  styleUrl: './conversation.component.css',
})
export class ConversationComponent implements OnInit, OnDestroy {
  @Input() conversation!: Conversation;
  @ViewChild('chatBody') private chatBody!: ElementRef;
  @ViewChild(ScrollDirective) scrollDirective!: ScrollDirective;
  socket!: Socket;
  socketConnectionData!: Socket<DefaultEventsMap, DefaultEventsMap>;
  currentUser!: User;
  otherUser!: User;
  subscriptions = new Subscription();
  messages: Message[] = [];
  newMessage: Message = {
    body: '',
    seen: false,
    conversation_id: '',
    sender_id: this.userService.getCurrentUserId(),
    receiver_id: '',
  };
  totalMessageCount: number = 0;
  currentMessagesPage: number = 0;
  messagesPerPage: number = 5;
  conversationStatusOfCurrentUser: 'minimzed' | 'closed' | 'active' = 'active';
  constructor(
    private authService: AuthService,
    private userService: UserService,
    private socketService: SocketService,
    private messageService: MessageService,
    private conversationService: ConversationService,
    private shareDataService: ShareDataService,
    private render: Renderer2,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    this.getCurrentUser();
    Promise.all([this.getMessagesCountOfConversation()])
      .then(() => {
        this.getMessagesOfConversation();
        this.determineOtherUser();
        this.listenToNewMessage();
        this.listenToSeenMessage();
      })
      .catch((error) => {
        console.error('An error occurred:', error);
      });
  }
  getCurrentUser() {
    this.currentUser = this.userService.spreadUserMedia(
      this.localStorageService.getItem('user')
    );
  }
  getMessagesCountOfConversation(): Promise<void> {
    let messagesPerPage = 5;
    return new Promise((resolve, reject) => {
      this.subscriptions.add(
        this.messageService
          .countConversationMessages(this.conversation.id!)
          .subscribe((res) => {
            this.totalMessageCount = res.body!.messagesCount;
            this.currentMessagesPage = Math.ceil(
              this.totalMessageCount / messagesPerPage
            );
            resolve(); // Resolve the Promise when the asynchronous operation completes
          }, reject)
      );
    });
  }
  getMessagesOfConversation() {
    if (this.currentMessagesPage > 0) {
      this.subscriptions.add(
        this.messageService
          .getMessagesOfConversation(
            this.conversation.id!,
            this.currentMessagesPage + '',
            this.messagesPerPage + ''
          )
          .subscribe((res) => {
            this.scrollDirective.prepareFor('up');
            this.messages.unshift(...res.body!.messages.rows);
            this.currentMessagesPage--;
            if (
              this.messages.length < this.messagesPerPage &&
              this.currentMessagesPage > 0
            ) {
              this.getMessagesOfConversation();
            }
            setTimeout(() => this.scrollDirective.restore());
          })
      );
    }
  }
  sendMessage() {
    this.newMessage.conversation_id = this.conversation.id!;
    this.subscriptions.add(
      this.messageService.sendMessage(this.newMessage).subscribe((res) => {
        setTimeout(() => this.scrollDirective.reset());
        this.messages.push(res.body!.message);
      })
    );
    this.newMessage.body = '';
  }
  determineOtherUser() {
    this.conversation.first_user = this.userService.spreadUserMedia(
      this.conversation.first_user!
    );
    this.conversation.second_user = this.userService.spreadUserMedia(
      this.conversation.second_user!
    );
    this.otherUser =
      this.conversation.first_user?.id == this.currentUser.id
        ? this.conversation.second_user!
        : this.conversation.first_user!;
    debugger;
    if (this.otherUser) this.newMessage.receiver_id = this.otherUser.id!;
  }
  listenToNewMessage() {
    this.subscriptions.add(
      this.messageService.$newMessageToConversation.subscribe((message) => {
        this.messages.push(message);
      })
    );
  }
  seenMessages() {
    let seenCount = 0;
    this.messages.forEach((message) => {
      if (
        message.receiver_id === this.currentUser.id &&
        message.seen === false
      ) {
        this.subscriptions.add(
          this.messageService
            .seenMessages(message.id!, message.sender_id)
            .subscribe((res) => {
              if (res.body?.message === 'updated') {
                message.seen = true;
                seenCount++;
              }
            })
        );
      }
    });
    this.shareDataService.$userSeenMessage.next({
      sender_id: this.otherUser.id!,
      count: seenCount,
    });
  }
  changeConversationStatus(action: 'minimzed' | 'closed' | 'active') {
    let first_user_status = this.conversation.first_user_status;
    let second_user_status = this.conversation.second_user_status;
    if (this.conversation.first_user_id === this.currentUser.id) {
      first_user_status = action;
    } else if (this.conversation.second_user_id === this.currentUser.id) {
      second_user_status = action;
    }
    this.conversationStatusOfCurrentUser = action;
    this.subscriptions.add(
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
        })
    );
  }
  listenToSeenMessage() {
    this.socketService.socket.on('seen-message', (message_id: string) => {
      this.messages.forEach((message) => {
        if (message.id == message_id) {
          message.seen = true;
        }
      });
    });
  }
  onScroll() {
    console.log('s');
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
