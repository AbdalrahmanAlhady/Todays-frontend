import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '../shared/models/user.model';
import { Router } from '@angular/router';
import { SocketService } from '../shared/services/socket.service';
import { UserService } from '../shared/services/user.service';
import { Conversation } from '../shared/models/conversation.model';
import { ConversationService } from '../shared/services/conversation.service';
import { Message } from '../shared/models/message.model';
import { MessageService } from '../shared/services/message.service';

@Component({
  selector: 'app-conversation-list',
  templateUrl: './conversation-list.component.html',
  styleUrl: './conversation-list.component.css',
})
export class ConversationListComponent implements OnInit, OnDestroy {
  onlineFriendsList: User[] = [];
  conversations: Conversation[] = [];
  openedConversations: Map<string, Conversation> = new Map();
  unseenMessagesPerUserConversation: Map<string, number> = new Map();
  constructor(
    private socketService: SocketService,
    private conversationService: ConversationService,
    private userService: UserService,
    private messageService: MessageService
  ) {}
  ngOnInit(): void {
    Promise.all([this.getOnlineFriends(), this.getConversationsOfCurrentUser()])
      .then(() => {
        this.calcUnseenMessages();
        this.listenToMessages();
        this.listenToCloseConversation();
      })
      .catch((error) => {
        console.error('An error occurred:', error);
      });
  }
  getOnlineFriends(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socketService.ListenToOnlineFriends();
      this.socketService.$onlineFriendsList.subscribe((userList) => {
        this.onlineFriendsList = userList;
        resolve();
      }, reject);
    });
  }

  getConversationsOfCurrentUser(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.conversationService
        .getConversationsOfUser(this.userService.getCurrentUserId())
        .subscribe((res) => {
          this.conversations = res.body!.conversations.rows;
          resolve();
        }, reject);
    });
  }

  openChat(sender_id: string) {
    let currentUser_id = this.userService.getCurrentUserId();
    let foundConversation = this.conversations.find(
      ({ first_user, second_user }) =>
        (first_user?.id === currentUser_id && second_user?.id === sender_id) ||
        (first_user?.id === sender_id && second_user?.id === currentUser_id)
    );
    if (foundConversation) {
      if (
        foundConversation.first_user_id ===
          this.userService.getCurrentUserId() &&
        foundConversation.first_user_status !== 'active'
      ) {
        foundConversation.first_user_status = 'active';
      } else if (
        foundConversation.second_user_id ===
          this.userService.getCurrentUserId() &&
        foundConversation.second_user_status !== 'active'
      ) {
        foundConversation.second_user_status = 'active';
      }
      this.conversationService
        .updateConversation(
          foundConversation.id!,
          foundConversation.first_user_status,
          foundConversation.second_user_status
        )
        .subscribe((res) => {
          this.openedConversations.set(
            foundConversation?.id!,
            foundConversation!
          );
        });
    } else if (!foundConversation) {
      this.conversationService
        .createConversation(
          this.userService.getCurrentUserId(),
          sender_id,
          'active',
          'closed'
        )
        .subscribe((res) => {
          this.conversations.push(res.body!.conversation);
          this.openedConversations.set(
            res.body!.conversation.id!,
            res.body!.conversation!
          );
        });
    }
  }
  calcUnseenMessages() {
    this.onlineFriendsList.forEach((user) => {
      this.conversations.forEach((conversation) => {
        console.log('conv', conversation);
        if (
          conversation.first_user_id === user.id ||
          conversation.second_user_id === user.id
        ) {
          this.conversationService
            .getUnseenMessages(
              conversation.id!,
              this.userService.getCurrentUserId()!
            )
            .subscribe((res) => {
              this.unseenMessagesPerUserConversation.set(
                user.id!,
                res.body!.messages.count
              );
            });
        }
      });
    });
    console.log(this.unseenMessagesPerUserConversation);
  }
  listenToMessages() {
    this.socketService.socket.on('message', (message: Message) => {
      this.openChat(message.sender_id);
      this.messageService.$newMessageToConversation.next(message);
    });
  }
  listenToCloseConversation() {
    this.conversationService.$closeConversation.subscribe((conversation_id) => {
      this.openedConversations.delete(conversation_id);
    });
  }
  ngOnDestroy(): void {}
}
