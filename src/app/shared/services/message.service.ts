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
    postsNumber?: string
  ) {
    let queryParams = new HttpParams();
    if (page) queryParams = queryParams.append('page', page);
    if (postsNumber) queryParams = queryParams.append('limit', postsNumber);
    console.log('conversation_id', conversation_id);
    
    return this.http.get<{ messages: { count: number; rows: Message[] } }>(
      `${EndPoint.API_ROOT}/${EndPoint.MESSAGES_API}/conversation/${conversation_id}`,
      { observe: 'response', params: queryParams }
    );
  }
  seenMessages(id: string) {
    return this.http.patch<{ message: string }>(
      `${EndPoint.API_ROOT}/${EndPoint.MESSAGES_API}/${id}`,
      { seen: true },
      { observe: 'response' }
    );
  }
}
