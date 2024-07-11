export interface Media {
  id?: string;
  url: string;
  type: 'img' | 'video';
  storageProvider: string;
  post_id: string | null;
  comment_id: string | null;
  owner_id: string ;
  for: 'post' | 'comment'|'profile'|'cover';
  dimensions: {
    width: number;
    height: number;
  } | null;
  current: boolean|null;
  createdAt?: Date;
  updatedAt?: Date;
}
