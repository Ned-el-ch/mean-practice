import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthData } from './auth-data.model';

import { environment } from '../../environments/environment';
const API_URL = environment.apiUrl;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticated = false;
  private token: string;
  private timer: NodeJS.Timer;
  private authStatusListener = new Subject<boolean>();
  private userId: string;

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getAuthStatus() {
    return this.isAuthenticated;
  }

  createUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    return this.http
      .post(`${API_URL}/users/signup`, authData)
      .subscribe(
        (res) => {
          this.router.navigate(['/']);
          console.log(res);
        },
        (error) => {
          this.authStatusListener.next(false);
          console.log(error);
        }
      );
  }

  loginUser(email: string, password: string) {
    const authData: AuthData = { email, password };
    this.http
      .post<{ token: string; expiresIn: number; userId: string }>(
        `${API_URL}/users/login`,
        authData
      )
      .subscribe(
        (res) => {
          this.token = res.token;
          if (this.token) {
            const expiresInDuration = res.expiresIn;
            const expirationDate =
              new Date().getTime() + expiresInDuration * 1000;
            this.setAuthTimer(expiresInDuration);
            this.isAuthenticated = true;
            this.userId = res.userId;
            this.authStatusListener.next(true);
            this.saveAuthData(
              this.token,
              new Date(expirationDate),
              this.userId
            );
            this.router.navigate(['/']);
          }
        },
        (error) => {
          this.authStatusListener.next(false);
          console.log(error);
        }
      );
  }

  autoAuthUser() {
    const authInfo = this.getAuthData();
    if (!authInfo) {
      return;
    }
    const remainingTime =
      authInfo.expirationDate.getTime() - new Date().getTime();
    if (remainingTime > 0) {
      this.token = authInfo.token;
      this.userId = authInfo.userId;
      this.isAuthenticated = true;
      this.authStatusListener.next(true);
      this.setAuthTimer(remainingTime / 1000);
    }
  }

  logoutUser() {
    this.token = null;
    this.isAuthenticated = false;
    this.router.navigate(['/']);
    this.authStatusListener.next(false);
    clearTimeout(this.timer);
    this.clearAuthData();
    this.userId = null;
  }

  private setAuthTimer(expiresInDuration: number) {
    console.log(`Setting timer: ${expiresInDuration}`);
    this.timer = setTimeout(() => {
      this.logoutUser();
    }, expiresInDuration * 1000);
  }

  private saveAuthData(token: string, expirationDate: Date, userId: string) {
    localStorage.setItem('token', token);
    localStorage.setItem('userId', userId);
    localStorage.setItem('expirationDate', expirationDate.toISOString());
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('expirationDate');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expirationDate');
    const userId = localStorage.getItem('userId');
    if (!token || !expirationDate) {
      return;
    }
    return { token, expirationDate: new Date(expirationDate), userId };
  }
}
