export interface Message {
    id?: string;
    body: string;
    seen:boolean;
    sender_id:string;
    receiver_id:string;
    conversation_id:string;
    createdAt?:Date;
    updatedAt?:Date;  
  }