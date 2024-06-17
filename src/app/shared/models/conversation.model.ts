import { User } from "./user.model";

export interface Conversation {
    id?: string;
    first_user_status:'active'|'minimzed'|'closed';
    second_user_status:'active'|'minimzed'|'closed';
    first_user_id:string;
    second_user_id:string;
    first_user?:User;
    second_user?:User;
    createdAt?:Date;
    updatedAt?:Date;  
  }