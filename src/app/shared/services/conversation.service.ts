import { Injectable } from '@angular/core';
import { EndPoint } from '../endpoints/EndPoint';
import { Conversation } from '../models/conversation.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Message } from '../models/message.model';

@Injectable({
  providedIn: 'root',
})
export class ConversationService {
  $openRecivedConversations = new Subject<string>();
  $closeConversation = new Subject<string>();
  constructor(private http: HttpClient) {}

  createConversation(
    first_user_id: string,
    second_user_id: string,
    first_user_status: 'active'|'minimzed'|'closed',
    second_user_status: 'active'|'minimzed'|'closed'
  ) {
    return this.http.post<{ conversation: Conversation }>(
      `${EndPoint.API_ROOT}/${EndPoint.CONVERSATIONS_API}/first_user_id/${first_user_id}/second_user_id/${second_user_id}`,
      { first_user_status, second_user_status },
      { observe: 'response' }
    );
  }
  getConversationsOfUser(
    user_id: string,
    conversation_id?: string,
    page?: string,
    postsNumber?: string
  ) {
    let queryParams = new HttpParams();
    if (page) queryParams = queryParams.append('page', page);
    if (postsNumber) queryParams = queryParams.append('limit', postsNumber);
    if (conversation_id)
      queryParams = queryParams.append('id', conversation_id);
    return this.http.get<{
      conversations: { count: number; rows: Conversation[] };
    }>(`${EndPoint.API_ROOT}/${EndPoint.CONVERSATIONS_API}/user/${user_id}`, {
      observe: 'response',
      params: queryParams,
    });
  }
  updateConversation(
    conversation_id: string,
    first_user_status: string,
    second_user_status: string
  ) {
    return this.http.patch<{ message: string }>(
      `${EndPoint.API_ROOT}/${EndPoint.CONVERSATIONS_API}/${conversation_id}`,
      { first_user_status, second_user_status },
      { observe: 'response' }
    );
  }

  getUnseenMessages(conversation_id: string, receiver_id: string) {
    return this.http.get<{
      messages: { count: number; rows: Message[] };
    }>(
      `${EndPoint.API_ROOT}/${EndPoint.CONVERSATIONS_API}/${conversation_id}/unseenMessages/receiver/${receiver_id}`,
      {
        observe: 'response',
      }
    );
  }
}
