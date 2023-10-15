import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, take } from 'rxjs';
import { UserService } from '../services/user.service';
import { User } from '../models/identity/User';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private _userService: UserService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    let currentUser: User;

    this._userService.currentUser$.pipe(take(1)).subscribe({
      next: (user: User) => {
        currentUser = user;
        if (currentUser) {
          request = request.clone({
            setHeaders: {
              Authorization: `Bearer ${currentUser.token}`,
            },
          });
        }
      },
    });

    return next.handle(request);
  }
}
