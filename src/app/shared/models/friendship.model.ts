import { User } from './user.model';

export interface Friendship {
  id?: string;
  status: 'requested'|'accepted';
  sender_id: string;
  receiver_id: string;
  sender?: User;
  receiver?: User;
  createdAt?: Date;
  updatedAt?: Date;
}
