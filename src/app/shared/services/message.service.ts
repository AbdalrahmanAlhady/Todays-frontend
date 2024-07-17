import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '../models/message.model';
import { EndPoint } from '../endpoints/EndPoint';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MessageService {
  constructor(private http: HttpClient) {}
  $newMessageToConversation = new Subject<Message>();
  sendMessage(message: Message) {
    return this.http.post<{ message: Message }>(
      `${EndPoint.API_ROOT}/${EndPoint.MESSAGES_API}`,
      message,
      { observe: 'response' }
    );
  }
  getMessagesOfConversation(
    conversation_id: string,
    page?: string,
    messagesNumber?: string
  ) {
    let queryParams = new HttpParams();
    if (page) queryParams = queryParams.append('page', page);
    if (messagesNumber)
      queryParams = queryParams.append('limit', messagesNumber);

    return this.http.get<{ messages: { count: number; rows: Message[] } }>(
      `${EndPoint.API_ROOT}/${EndPoint.MESSAGES_API}/conversation/${conversation_id}`,
      { observe: 'response', params: queryParams }
    );
  }
  seenMessages(id: string, sender_id: string) {
    return this.http.patch<{ message: string }>(
      `${EndPoint.API_ROOT}/${EndPoint.MESSAGES_API}/${id}`,
      { seen: true, sender_id },
      { observe: 'response' }
    );
  }
  countConversationMessages(conversation_id: string) {
    return this.http.get<{ messagesCount: number }>(
      `${EndPoint.API_ROOT}/${EndPoint.MESSAGES_API}/count/conversation/${conversation_id}`,
      { observe: 'response' }
    );
  }
}
