import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AccountService } from '../_services/account.service';
import { environment } from '../../environments/environment';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private accountService: AccountService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(catchError(err => {
            console.error('Error Interceptor:', err);
            
            if (err.status === 0) {
                // Network error or CORS error
                console.error('Network or CORS error. Please check if the backend is running at:', environment.apiUrl);
                return throwError(() => 'Unable to connect to the server. Please check if the server is running.');
            }

            if ([401, 403].includes(err.status) && this.accountService.accountValue) {
                // auto logout if 401 or 403 response returned from api
                this.accountService.logout();
            }

            const error = (err && err.error && err.error.message) || err.statusText;
            console.error('Error details:', {
                status: err.status,
                statusText: err.statusText,
                error: err.error,
                message: error
            });
            
            return throwError(() => error);
        }));
    }
}
