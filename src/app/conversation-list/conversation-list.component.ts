import { Component, OnDestroy, OnInit } from '@angular/core';
import { User } from '../shared/models/user.model';
import { Router } from '@angular/router';
import { SocketService } from '../shared/services/socket.service';
import { UserService } from '../shared/services/user.service';
import { Conversation } from '../shared/models/conversation.model';
import { ConversationService } from '../shared/services/conversation.service';
import { Message } from '../shared/models/message.model';
import { MessageService } from '../shared/services/message.service';
import { ShareDataService } from '../shared/services/share-data.service';

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
    private messageService: MessageService,
    private shareDataService: ShareDataService
  ) {}
  ngOnInit(): void {
    this.socketService.$socketConnected.subscribe((socketConnected) => {
      if (socketConnected) {
        Promise.all([
          this.getOnlineFriends(),
          this.getConversationsOfCurrentUser(),
        ])
          .then(() => {
            this.listenToMessages();
            this.listenToCloseConversation();
            this.listenToUpdateUnseenCount();
          })
          .catch((error) => {
            console.error('An error occurred:', error);
          });
      }
    });
  }
  getOnlineFriends(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socketService.ListenToOnlineFriends();
      this.socketService.getOnlineFriends();
      this.socketService.$onlineFriendsList.subscribe((userList) => {
        this.onlineFriendsList = userList;
        this.onlineFriendsList.forEach((friend) => {
          friend = this.userService.spreadUserMedia(friend);
          this.calcUnseenMessages(friend);
        });
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

  openChat(other_user_id: string) {
    let currentUser_id = this.userService.getCurrentUserId();
    let foundConversation = this.conversations.find(
      ({ first_user_id, second_user_id }) =>
        (first_user_id === currentUser_id &&
          second_user_id === other_user_id) ||
        (first_user_id === other_user_id && second_user_id === currentUser_id)
    );
    if (foundConversation) {
      this.changeConversationStatus(foundConversation, 'active');
    } else if (!foundConversation) {
      this.conversationService
        .createConversation(
          this.userService.getCurrentUserId(),
          other_user_id,
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
  changeConversationStatus(
    conversation: Conversation,
    action: 'minimzed' | 'closed' | 'active'
  ) {
    let first_user_status = conversation.first_user_status;
    let second_user_status = conversation.second_user_status;
    if (conversation.first_user_id === this.userService.getCurrentUserId()) {
      first_user_status = action;
    } else {
      second_user_status = action;
    }
    this.conversationService
      .updateConversation(
        conversation.id!,
        first_user_status,
        second_user_status
      )
      .subscribe((res) => {
        if (res.body?.message === 'updated') {
          conversation.first_user_status = first_user_status;
          conversation.second_user_status = second_user_status;
          if (action === 'closed') {
            this.conversationService.$closeConversation.next(conversation.id!);
          } else if (action === 'active') {
            this.openedConversations.set(conversation.id!, conversation);
          }
        }
      });
  }
  calcUnseenMessages(onlineFriend: User) {
    this.conversations.forEach((conversation) => {
      if (
        conversation.first_user_id === onlineFriend.id ||
        conversation.second_user_id === onlineFriend.id
      ) {
        this.conversationService
          .getUnseenMessages(
            conversation.id!,
            this.userService.getCurrentUserId()!
          )
          .subscribe((res) => {
            this.unseenMessagesPerUserConversation.set(
              onlineFriend.id!,
              res.body!.messages.count
            );
          });
      }
    });
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
  listenToUpdateUnseenCount() {
    this.shareDataService.$userSeenMessage.subscribe((res) => {
      this.unseenMessagesPerUserConversation.set(res.sender_id, res.count);
    });
  }
  ngOnDestroy(): void {}
}
