import { Injectable } from '@angular/core';
import {
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {    
    if (req.headers.get('skip')) {
      return next.handle(req);
    } else if (this.authService.$userAccessToken.getValue()) {
      if (this.authService.refreshTokenExpiry()<=10) {
        this.authService.signout();
      } else if (this.authService.accessTokenExpiry() <= 5) {
        this.authService.refreshAccessToken().subscribe((res) => {
          localStorage.setItem(
            'accessToken',
            JSON.stringify(res.body?.newAccessToken!)
          );
          this.authService.$userAccessToken.next(res.body?.newAccessToken!);
        });
      }
      const modifiedReq = req.clone({
        headers: new HttpHeaders().set(
          'Authorization',
          'Bearer ' + this.authService.$userAccessToken.getValue()!
        ),
      });
      return next.handle(modifiedReq);
    } else {
      return next.handle(req);
    }
  
  }
}
