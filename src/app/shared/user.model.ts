export interface User {
  _id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  password?: string;
  cPassword?: string;
  profileImg?: string;
  birthdate: Date;
  gender: 'male' | 'female';
}
