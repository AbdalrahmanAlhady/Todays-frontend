import { Component, Input } from '@angular/core';
import { Message } from '../../../../../shared/models/message.model';
import { UserService } from '../../../../../shared/services/user.service';
import { Conversation } from 'src/app/shared/models/conversation.model';

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrl: './message.component.css',
})
export class MessageComponent {
  @Input() message!: Message;
  @Input() conversation!: Conversation;
  currentUser_id!: string;
  constructor(private userService: UserService) {
    this.currentUser_id = this.userService.getCurrentUserId();
  }
}
