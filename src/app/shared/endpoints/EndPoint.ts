export class EndPoint {
  public static API_ROOT = 'http://localhost:3000';
  public static AUTH_API = {
    Signup: 'api/v1/auth/signup',
    Signin: 'api/v1/auth/signin',
    SendOTP: 'api/v1/auth/sendOTP',
    changePassword: 'api/v1/auth/changePassword',
    verifyEmail: 'api/v1/auth/verify-email',
  };

  public static USERS_API = 'api/v1/users';
  public static POSTS_API = 'api/v1/posts';
  public static COMMENTS_API = 'api/v1/comments';
  public static MEDIA_API = 'api/v1/media';
  public static NOTIFICATIONS_API = 'api/v1/notifications';  
  public static FRIENDSHIPS_API = 'api/v1/friendships';
  public static POST_LIKES_API = 'api/v1/postLikes';
  public static MESSAGES_API = 'api/v1/messages';
  public static CONVERSATIONS_API = 'api/v1/conversations';
}
