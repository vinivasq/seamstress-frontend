import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, map, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/identity/User';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private currentUserSource = new ReplaySubject<User>(1);
  public currentUser$ = this.currentUserSource.asObservable();

  baseURL = `${environment.apiURL}/user`;

  constructor(private _client: HttpClient) {}

  public login(model: any): Observable<void> {
    return this._client.post<User>(`${this.baseURL}/login`, model).pipe(
      take(1),
      map((response: User) => {
        const user = response;
        if (user) {
          this.setCurrentUser(user);
        }
      })
    );
  }

  public register(model: any): Observable<void> {
    return this._client.post(`${this.baseURL}/register`, model).pipe(
      take(1),
      map((response: User) => {
        const user = response;
        if (user) {
          this.setCurrentUser(user);
        }
      })
    );
  }

  public getExecutors() {
    return this._client.get(`${this.baseURL}/executors`).pipe(take(1));
  }

  public setCurrentUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSource.next(user);
  }

  public logout(): void {
    localStorage.removeItem('user');
    this.currentUserSource.next(null);
  }
}
