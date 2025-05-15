import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, timeout } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AccountService } from './account.service';

@Injectable({ providedIn: 'root' })
export class RequestService {
    constructor(
        private http: HttpClient,
        private router: Router,
        private accountService: AccountService
    ) { }

    private handleError(error: HttpErrorResponse) {
        console.error('Request Service Error Details:', {
            status: error.status,
            statusText: error.statusText,
            error: error.error,
            message: error.message,
            url: error.url
        });
        
        let errorMessage = 'An error occurred';
        
        if (error.status === 0) {
            // A client-side or network error occurred
            errorMessage = 'Unable to connect to the server. Please check if the server is running at ' + environment.apiUrl;
        } else if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Client Error: ${error.error.message}`;
        } else if (error.status === 401) {
            // Unauthorized - redirect to login
            this.router.navigate(['/account/login']);
            errorMessage = 'Your session has expired. Please log in again.';
        } else if (error.status === 403) {
            // Forbidden - account might be deactivated
            errorMessage = 'Your account is deactivated. Please contact your administrator.';
        } else {
            // Server-side error
            errorMessage = error.error?.message || `Server Error: ${error.status} - ${error.statusText}`;
        }
        
        return throwError(() => errorMessage);
    }

    private getHeaders() {
        const account = this.accountService.accountValue;
        console.log('Request Service - Account:', account);
        console.log('Request Service - JWT Token:', account?.jwtToken);
        
        if (!account?.jwtToken) {
            console.error('Request Service - No JWT token found in account:', account);
            this.router.navigate(['/account/login']);
            throw new Error('No authentication token found');
        }
        
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${account.jwtToken}`
        });
        console.log('Request Service - Headers:', headers);
        return headers;
    }

    private getRequestOptions() {
        const options = {
            headers: this.getHeaders(),
            withCredentials: true
        };
        console.log('Request Service - Request Options:', options);
        return options;
    }

    getAll() {
        console.log('Request Service - Fetching all requests from:', `${environment.apiUrl}/requests`);
        return this.http.get<any[]>(`${environment.apiUrl}/requests`, this.getRequestOptions())
            .pipe(
                tap(response => console.log('Request Service - Get All Response:', response)),
                timeout(5000),
                catchError(this.handleError.bind(this))
            );
    }

    getById(id: string) {
        console.log('Fetching request by id:', id);
        return this.http.get<any>(`${environment.apiUrl}/requests/${id}`, this.getRequestOptions())
            .pipe(
                tap(response => console.log('Get By Id Response:', response)),
                timeout(5000),
                catchError(this.handleError.bind(this))
            );
    }

    create(request: any) {
        console.log('Creating request at:', `${environment.apiUrl}/requests`);
        console.log('Request data:', JSON.stringify(request, null, 2));
        const requestData = {
            type: request.type,
            description: request.description,
            status: request.status,
            employeeId: request.employeeId,
            requestItems: request.requestItems.map((item: any) => ({
                name: item.name,
                quantity: item.quantity
            }))
        };
        console.log('Processed request data:', JSON.stringify(requestData, null, 2));
        return this.http.post(`${environment.apiUrl}/requests`, requestData, this.getRequestOptions())
            .pipe(
                tap(response => console.log('Create Response:', response)),
                timeout(5000),
                catchError(this.handleError.bind(this))
            );
    }

    update(id: string, request: any) {
        console.log('Updating request at:', `${environment.apiUrl}/requests/${id}`);
        console.log('Request data:', JSON.stringify(request, null, 2));
        const requestData = {
            type: request.type,
            description: request.description,
            status: request.status,
            employeeId: request.employeeId,
            requestItems: request.requestItems.map((item: any) => ({
                name: item.name,
                quantity: item.quantity
            }))
        };
        console.log('Processed request data:', JSON.stringify(requestData, null, 2));
        return this.http.put(`${environment.apiUrl}/requests/${id}`, requestData, this.getRequestOptions())
            .pipe(
                tap(response => console.log('Update Response:', response)),
                timeout(5000),
                catchError(this.handleError.bind(this))
            );
    }

    delete(id: string) {
        console.log('Deleting request at:', `${environment.apiUrl}/requests/${id}`);
        return this.http.delete(`${environment.apiUrl}/requests/${id}`, this.getRequestOptions())
            .pipe(
                tap(response => console.log('Delete Response:', response)),
                timeout(5000),
                catchError(this.handleError.bind(this))
            );
    }
} 