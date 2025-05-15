import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<any[]> {
    console.log('EmployeeService: GET', this.apiUrl);
    return this.http.get<any[]>(this.apiUrl);
  }

  getEmployee(id: string): Observable<any> {
    console.log('EmployeeService: GET', `${this.apiUrl}/${id}`);
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employee: any): Observable<any> {
    console.log('EmployeeService: POST', this.apiUrl, employee);
    return this.http.post<any>(this.apiUrl, employee);
  }

  updateEmployee(id: string, employee: any): Observable<any> {
    console.log('EmployeeService: PUT', `${this.apiUrl}/${id}`, employee);
    return this.http.put<any>(`${this.apiUrl}/${id}`, employee);
  }

  deleteEmployee(id: string): Observable<any> {
    console.log('EmployeeService: DELETE', `${this.apiUrl}/${id}`);
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
} 