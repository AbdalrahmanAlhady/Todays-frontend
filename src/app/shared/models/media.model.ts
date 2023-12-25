export interface Media {
  id?: string;
  url: string;
  type: 'img' | 'video';
  storageProvider: string;
  post_id:string|null;
  comment_id:string|null;
  createdAt?:Date;
  updatedAt?:Date;
}
