import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, finalize } from 'rxjs/operators';

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
    } else {
      localStorage.removeItem('account');
    }
    // Update subject
    this.accountSubject.next(account);
  }
  
  login(email: string, password: string) {
    return this.http.post<any>(`${baseUrl}/accounts/authenticate`, { email, password }, { withCredentials: true })
      .pipe(map(account => {
        console.log('Login response:', account);
        // Ensure role is set correctly
        if (account.role === 'Admin') {
          account.role = Role.Admin;
        } else if (account.role === 'User') {
          account.role = Role.User;
        }
        console.log('Processed account:', account);
        this.setAccount(account);
        this.startRefreshTokenTimer();
        return account;
      }));
  }

  logout() {
    this.http.post<any>(`${baseUrl}/accounts/revoke-token`, {}, { withCredentials: true }).subscribe();
    this.stopRefreshTokenTimer();
    this.setAccount(null);
    this.router.navigate(['/accounts/login']);
  }

  refreshToken() {
    return this.http.post<any>(`${baseUrl}/accounts/refresh-token`, {}, { withCredentials: true })
      .pipe(map((account) => {
        console.log('Refresh token response:', account);
        // Ensure role is set correctly
        if (account.role === 'Admin') {
          account.role = Role.Admin;
        } else if (account.role === 'User') {
          account.role = Role.User;
        }
        console.log('Processed account:', account);
        this.setAccount(account);
        this.startRefreshTokenTimer();
        return account;
      }));
  }

  register(account: Account) {
    return this.http.post(`${baseUrl}/accounts/register`, account);
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
    return this.http.delete(`${baseUrl}/accounts/${id}`)
      .pipe(finalize(() => {
        if (id === String(this.accountValue?.id)) {
          this.logout();
        }
      }));
  }

  private refreshTokenTimeout: any;

  private startRefreshTokenTimer() {
    const jwtToken = this.accountValue?.jwtToken
      ? JSON.parse(atob(this.accountValue.jwtToken.split('.')[1]))
      : null;

    const expires = new Date(jwtToken.exp * 1000);
    const timeout = expires.getTime() - Date.now() - (60 * 1000);
    this.refreshTokenTimeout = setTimeout(() => this.refreshToken().subscribe(), timeout);
  }

  private stopRefreshTokenTimer() {
    clearTimeout(this.refreshTokenTimeout);
  }
}