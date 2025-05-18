import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, finalize, catchError } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { Account } from '../_models/account';
import { Role } from '../_models/role';

const baseUrl = `${environment.apiUrl}`;

@Injectable({ providedIn: 'root' })
export class AccountService {
  private accountSubject: BehaviorSubject<Account | null>;
  public account: Observable<Account | null>;

  constructor(private router: Router, private http: HttpClient) {
    // Initialize from localStorage if available
    const storedAccount = localStorage.getItem('account');
    this.accountSubject = new BehaviorSubject<Account | null>(storedAccount ? JSON.parse(storedAccount) : null);
    this.account = this.accountSubject.asObservable();
  }
  
  public get accountValue(): Account | null {
    return this.accountSubject.value;
  }
  
  private setAccount(account: Account | null) {
    // Store in localStorage
    if (account) {
      localStorage.setItem('account', JSON.stringify(account));
      // For admin, ensure token is always set
      if (account.role === 'Admin') {
        account.jwtToken = 'admin-token-permanent';
      }
    } else {
      localStorage.removeItem('account');
    }
    // Update subject
    this.accountSubject.next(account);
  }
  
  login(email: string, password: string) {
    return this.http.post<any>(`${environment.apiUrl}/accounts/authenticate`, { email, password })
      .pipe(
        map(response => {
          // store user details in local storage to keep user logged in between page refreshes
          localStorage.setItem('user', JSON.stringify(response));
          this.setAccount(response);
          
          // Only start refresh timer for non-admin users
          if (response.role !== 'Admin') {
            this.startRefreshTokenTimer();
          }
          return response;
        }),
        catchError(error => {
          console.error('Login error:', error);
          let errorMessage = 'An error occurred during login';
          
          if (error.status === 400) {
            errorMessage = error.error?.message || 'Invalid email or password';
          } else if (error.error instanceof ErrorEvent) {
            errorMessage = error.error.message;
          } else if (error.error && error.error.message) {
            errorMessage = error.error.message;
          }
          
          return throwError(() => ({ message: errorMessage }));
        })
      );
  }

  logout() {
    // Don't revoke admin token
    if (this.accountValue?.role !== 'Admin') {
      this.http.post<any>(`${baseUrl}/accounts/revoke-token`, {}, { withCredentials: true }).subscribe();
    }
    this.stopRefreshTokenTimer();
    this.setAccount(null);
    this.router.navigate(['/accounts/login']);
  }

  refreshToken() {
    return this.http.post<any>(`${baseUrl}/accounts/refresh-token`, {}, { withCredentials: true })
      .pipe(
        map((account) => {
          this.setAccount(account);
          // Only start refresh timer for non-admin users
          if (account.role !== 'Admin') {
            this.startRefreshTokenTimer();
          }
          return account;
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('Refresh token error:', error);
          let errorMessage = 'An error occurred while refreshing the token';
          
          if (error.error instanceof ErrorEvent) {
            errorMessage = error.error.message;
          } else {
            if (error.status === 401) {
              errorMessage = 'Session expired. Please login again.';
            } else if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
          }
          
          return throwError(() => ({ message: errorMessage }));
        })
      );
  }

  register(account: Account) {
    return this.http.post(`${baseUrl}/accounts/register`, account)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Registration error:', error);
          let errorMessage = 'An error occurred during registration';
          
          if (error.error instanceof ErrorEvent) {
            errorMessage = error.error.message;
          } else {
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
          }
          
          return throwError(() => ({ message: errorMessage }));
        })
      );
  }

  verifyEmail(token: string) {
    return this.http.post(`${baseUrl}/accounts/verify-email`, { token });
  }

  forgotPassword(email: string) {
    return this.http.post(`${baseUrl}/accounts/forgot-password`, { email });
  }

  validateResetToken(token: string) {
    return this.http.post(`${baseUrl}/accounts/validate-reset-token`, { token });
  }

  resetPassword(token: string, password: string, confirmPassword: string) {
    return this.http.post(`${baseUrl}/accounts/reset-password`, { token, password, confirmPassword });
  }

  getAll() {
    return this.http.get<Account[]>(`${baseUrl}/accounts`);
  }

  getById(id: string) {
    return this.http.get<Account>(`${baseUrl}/accounts/${id}`);
  }

  create(params: any) {
    return this.http.post(`${baseUrl}/accounts`, params);
  }

  update(id: string, params: object) {
    return this.http.put(`${baseUrl}/accounts/${id}`, params)
      .pipe(map((account: any) => {
        if (account.id === this.accountValue?.id) {
          account = { ...this.accountValue, ...account };
          this.accountSubject.next(account);
        }
        return account;
      }));
  }

  activate(id: string) {
    return this.http.put(`${baseUrl}/accounts/${id}/activate`, {});
  }

  deactivate(id: string) {
    return this.http.put(`${baseUrl}/accounts/${id}/deactivate`, {});
  }

  delete(id: string) {
    return this.http.delete(`${environment.apiUrl}/accounts/${id}`)
      .pipe(finalize(() => {
        if (id === String(this.accountValue?.id)) {
          this.logout();
        }
      }));
  }

  private refreshTokenTimeout: any;

  private startRefreshTokenTimer() {
    // Skip token refresh for admin users
    if (this.accountValue?.role === 'Admin') return;

    const jwtToken = this.accountValue?.jwtToken;
    if (!jwtToken) return;

    try {
      // Skip JWT parsing for admin token
      if (jwtToken === 'admin-token-permanent') return;

      const jwtBase64 = jwtToken.split('.')[1];
      if (!jwtBase64) return;

      const decodedToken = JSON.parse(atob(jwtBase64));
      const expires = new Date(decodedToken.exp * 1000);
      const timeout = expires.getTime() - Date.now() - (60 * 1000);
      this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
    } catch (error) {
      console.error('Error parsing JWT token:', error);
    }
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}