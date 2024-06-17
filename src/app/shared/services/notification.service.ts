import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Notification} from "../models/notification.model";
import { EndPoint } from '../endpoints/EndPoint';


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private http: HttpClient) { }
  getUserNotification(receiver_id:string) {
    return this.http.get<{ notifications: { count: number; rows: Notification[] } }>(
     ` ${EndPoint.API_ROOT}/${EndPoint.NOTIFICATIONS_API}/user/${receiver_id}`,
      {observe: 'response'}
    );
  }
  seenNotification(notification_id:string) {
    return this.http.patch<{message:string}>(
     ` ${EndPoint.API_ROOT}/${EndPoint.NOTIFICATIONS_API}/${notification_id}`,
     {seen:true},
     {observe: 'response'}
    );
  }
}
