import { Media } from "./media.model";

export interface User {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password?: string;
  cPassword?: string;
  profileImg?: string;
  profileCoverImg?: string;
  media?: Media[];
  birthdate: Date;
  gender: 'male' | 'female';
  createdAt?:Date;
  updatedAt?:Date;
}
