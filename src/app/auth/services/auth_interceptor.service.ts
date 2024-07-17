import { Injectable } from '@angular/core';
import {
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { switchMap } from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {  
    // If the request header contains 'skip', bypass the interceptor
    if (req.headers.get('skip')) {
      return next.handle(req);
    }
    // If user access token is present
    const userAccessToken = this.authService.$userAccessToken.getValue();
    if (userAccessToken) {
      const refreshTokenExpiry = this.authService.refreshTokenExpiry();
      const accessTokenExpiry = this.authService.accessTokenExpiry();
      // If the refresh token is about to expire, sign out the user
      if (refreshTokenExpiry <= 10) {
        this.authService.signout();
      } 
      // If the access token is about to expire, refresh it
      else if (accessTokenExpiry <= 1) {
        return this.authService.refreshAccessToken().pipe(
          switchMap((res) => {
            const newAccessToken = res.body?.newAccessToken!;
            localStorage.setItem('accessToken', JSON.stringify(newAccessToken));
            this.authService.$userAccessToken.next(newAccessToken);
            // Clone the original request with the new access token
            const modifiedReq = req.clone({
              headers: req.headers.set('Authorization', 'Bearer ' + newAccessToken)
            });
  
            return next.handle(modifiedReq);
          })
        );
      } 
      // If the access token is still valid, proceed with the original request
      else {
        const modifiedReq = req.clone({
          headers: req.headers.set('Authorization', 'Bearer ' + userAccessToken)
        });
        return next.handle(modifiedReq);
      }
    }
  
    // If no user access token is present, proceed with the original request
    return next.handle(req);
  }
  
}
