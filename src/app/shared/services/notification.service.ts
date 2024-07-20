import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Notification } from '../models/notification.model';
import { EndPoint } from '../endpoints/EndPoint';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  constructor(private http: HttpClient) {}
  getUserNotification(
    receiver_id: string,
    page?: string,
    notificationsNumber?: string,
  ) {
    let queryParams = new HttpParams();
    if (page) queryParams = queryParams.append('page', page);
    if (notificationsNumber) queryParams = queryParams.append('limit', notificationsNumber);
    return this.http.get<{
      notifications: { count: number; rows: Notification[] };
    }>(
      ` ${EndPoint.API_ROOT}/${EndPoint.NOTIFICATIONS_API}/user/${receiver_id}`,
      { observe: 'response' ,params: queryParams}
    );
  }
  seenNotification(notification_id: string) {
    return this.http.patch<{ message: string }>(
      ` ${EndPoint.API_ROOT}/${EndPoint.NOTIFICATIONS_API}/${notification_id}`,
      { seen: true },
      { observe: 'response' }
    );
  }
}
