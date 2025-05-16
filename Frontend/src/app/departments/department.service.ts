import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators';
import { Department } from './department.model';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class DepartmentService {
    private apiUrl = `${environment.apiUrl}/departments`;
    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    };

    constructor(private http: HttpClient) { }

    private handleError(error: HttpErrorResponse) {
        console.error('Full error object:', error);
        let errorMessage = 'An error occurred';
        
        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Error: ${error.error.message}`;
        } else {
            // Server-side error
            if (error.status === 404) {
                errorMessage = 'API endpoint not found. Please check the server configuration.';
            } else if (error.status === 0) {
                errorMessage = 'Unable to connect to the server. Please check if the server is running.';
            } else if (error.error && typeof error.error === 'object') {
                errorMessage = error.error.message || error.error.error || 'Server error occurred';
            } else if (typeof error.error === 'string') {
                errorMessage = error.error;
            } else if (error.message) {
                errorMessage = error.message;
            }
        }
        
        return throwError(() => new Error(errorMessage));
    }

    getDepartments(): Observable<Department[]> {
        console.log('Fetching departments from:', this.apiUrl);
        
        return this.http.get<any>(this.apiUrl, this.httpOptions).pipe(
            tap(response => {
                console.log('Raw API response:', response);
                console.log('Response type:', typeof response);
                console.log('Is Array?', Array.isArray(response));
            }),
            map(response => {
                if (!response) {
                    console.warn('Empty response received from server');
                    return [];
                }

                try {
                    // Handle array response
                    const departmentsData = Array.isArray(response) ? response : [response];
                    console.log('Departments data before mapping:', departmentsData);

                    const mappedDepartments = departmentsData.map(dept => {
                        console.log('Processing department:', dept);
                            return {
                                id: dept.id,
                                name: dept.name,
                                description: dept.description || null,
                                createdAt: dept.createdAt ? new Date(dept.createdAt) : new Date(),
                                updatedAt: dept.updatedAt ? new Date(dept.updatedAt) : new Date()
                            };
                    });

                    console.log('Mapped departments:', mappedDepartments);
                    return mappedDepartments;
                } catch (error) {
                    console.error('Error processing departments:', error);
                    throw error;
                }
            }),
            tap(departments => {
                console.log('Final processed departments:', departments);
            }),
            catchError(error => {
                console.error('Error in getDepartments:', error);
                return this.handleError(error);
            })
        );
    }

    getDepartment(id: number): Observable<Department> {
        return this.http.get<any>(`${this.apiUrl}/${id}`, this.httpOptions)
            .pipe(
                map(dept => ({
                    id: dept.id,
                    name: dept.name,
                    description: dept.description,
                    createdAt: new Date(dept.createdAt),
                    updatedAt: new Date(dept.updatedAt)
                })),
                tap(department => console.log('Received department:', department)),
                catchError(this.handleError)
            );
    }

    createDepartment(department: Partial<Department>): Observable<Department> {
        const departmentData = {
            name: department.name,
            description: department.description || null
        };

        console.log('Creating department at:', this.apiUrl);
        console.log('Department data:', departmentData);
        
        return this.http.post<any>(this.apiUrl, departmentData, this.httpOptions)
            .pipe(
                map(response => {
                    console.log('Create department response:', response);
                    return {
                        id: response.id,
                        name: response.name,
                        description: response.description,
                        createdAt: new Date(response.createdAt),
                        updatedAt: new Date(response.updatedAt)
                    };
                }),
                tap(newDepartment => console.log('Created department:', newDepartment)),
                catchError(this.handleError)
            );
    }

    updateDepartment(id: number, department: Partial<Department>): Observable<Department> {
        const departmentData = {
            name: department.name,
            description: department.description || null
        };

        return this.http.put<any>(`${this.apiUrl}/${id}`, departmentData, this.httpOptions)
            .pipe(
                map(response => ({
                    id: response.id,
                    name: response.name,
                    description: response.description,
                    createdAt: new Date(response.createdAt),
                    updatedAt: new Date(response.updatedAt)
                })),
                tap(updatedDepartment => console.log('Updated department:', updatedDepartment)),
                catchError(this.handleError)
            );
    }

    deleteDepartment(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`, this.httpOptions)
            .pipe(
                tap(() => console.log('Deleted department:', id)),
                catchError(this.handleError)
            );
    }
} 