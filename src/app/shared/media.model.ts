export interface Media {
  id?: string;
  url: string;
  type: 'img' | 'video';
  storageProvider: string;
  post_id:string
  createdAt?:Date;
  updatedAt?:Date;
}
