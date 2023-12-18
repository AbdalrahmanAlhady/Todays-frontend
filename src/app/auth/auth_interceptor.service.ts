import { Injectable } from '@angular/core';
import {
  HttpHandler,
  HttpHeaders,
  HttpInterceptor,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { AuthService } from './auth.service';
import { exhaustMap, take } from 'rxjs/operators';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    this.authService.getUserToken();
    if (!this.authService.userToken.getValue() || req.headers.get('skip')) {
      return next.handle(req);
    } else if (this.authService.userToken.getValue()) {
      const modifiedReq = req.clone({
        headers: new HttpHeaders().set(
          'Authorization',
          'Bearer ' + this.authService.userToken.getValue()!
        ),
      });
      return next.handle(modifiedReq);
      
    } else {
      return next.handle(req);
    }
  }
}