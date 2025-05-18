import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
  private apiUrl = `${environment.apiUrl}/employees`;

  constructor(private http: HttpClient) {}

  getEmployees(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getEmployee(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createEmployee(employee: any): Observable<any> {
    // Format the data before sending
    const formattedEmployee = {
      firstName: employee.firstName?.trim(),
      lastName: employee.lastName?.trim(),
      email: employee.email?.trim(),
      phone: employee.phone?.trim(),
      position: employee.position?.trim(),
      departmentId: parseInt(employee.departmentId),
      hireDate: employee.hireDate,
      salary: parseFloat(employee.salary),
      status: employee.status || 'Active'
    };

    // Log the formatted data
    console.log('Formatted employee data:', formattedEmployee);

    return this.http.post<any>(this.apiUrl, formattedEmployee);
  }

  updateEmployee(id: string, employee: any): Observable<any> {
    // Format the data before sending
    const formattedEmployee = {
      firstName: employee.firstName?.trim(),
      lastName: employee.lastName?.trim(),
      email: employee.email?.trim(),
      phone: employee.phone?.trim(),
      position: employee.position?.trim(),
      departmentId: parseInt(employee.departmentId),
      hireDate: employee.hireDate,
      salary: parseFloat(employee.salary)
    };

    console.log('Updating employee data:', formattedEmployee);
    return this.http.put<any>(`${this.apiUrl}/${id}`, formattedEmployee);
  }

  deleteEmployee(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  getEmployeeById(id: string) {
    return this.http.get<any>(`/api/employees/${id}`);
  }
} 