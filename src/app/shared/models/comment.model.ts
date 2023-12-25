import { Media } from "./media.model";
import { User } from "./user.model";

export interface Comment {
    id?: string;
    body: string;
    owner_id:string;
    post_id?:string;
    media?: Media;
    createdAt?:Date;
    updatedAt?:Date;  
    user?:User
  }