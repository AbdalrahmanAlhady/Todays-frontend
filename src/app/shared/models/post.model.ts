import { Comment } from './comment.model';
import { Media } from './media.model';
import { User } from './user.model';

export interface Post {
  id?: string;
  body: string;
  owner_id: string;
  createdAt?: Date;
  updatedAt?: Date;
  user?: User;
  media?: Media[];
  comments?: Comment[];
  likes?: { id: string; first_name: string; last_name: string }[];
}
