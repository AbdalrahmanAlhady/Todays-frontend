import { User } from './user.model';

export interface Notification {
  id?: string;
  message: string;
  receiver_id: string;
  sender_id: string;
  type:
    | 'like'
    | 'comment'
    | 'friend_post'
    | 'friendship_request'
    | 'friendship_accept';
  seen: boolean;
  post_id?:string;
  comment_id?:string;
  sender?: User;
  receiver?: User;
  createdAt?: Date;
  updatedAt?: Date;
}
