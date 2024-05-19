import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Notification} from "../models/notification.model";


@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private http: HttpClient) { }
  getUserNotification(receiver_id:string) {
    return this.http.get<{ notifications: { count: number; rows: Notification[] } }>(
     ` http://localhost:3000/api/v1/notification/getUserNotification/${receiver_id}`,
      {observe: 'response'}
    );
  }
}
