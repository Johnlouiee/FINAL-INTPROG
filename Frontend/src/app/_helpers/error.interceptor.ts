import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AccountService } from '../_services/account.service';
import { environment } from '../../environments/environment';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private accountService: AccountService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'An error occurred';
                
                // Handle network or CORS errors
                if (error.status === 0) {
                    console.error('Network or CORS error:', error);
                    errorMessage = 'Unable to connect to the server. Please check if the backend is running and accessible.';
                }
                // Handle 401 Unauthorized
                else if (error.status === 401) {
                    console.error('Unauthorized error:', error);
                    // Auto logout if 401 response returned from api
                    this.accountService.logout();
                    errorMessage = 'Your session has expired. Please log in again.';
                }
                // Handle 403 Forbidden
                else if (error.status === 403) {
                    console.error('Forbidden error:', error);
                    errorMessage = 'You do not have permission to access this resource.';
                }
                // Handle other errors
                else {
                    console.error('API error:', error);
                    // Get server-side error
                    errorMessage = error.error?.message || error.statusText || 'An unexpected error occurred';
                }

                console.error('Error details:', {
                    status: error.status,
                    statusText: error.statusText,
                    message: errorMessage,
                    url: request.url
                });

                return throwError(() => error);
            })
        );
    }
}
