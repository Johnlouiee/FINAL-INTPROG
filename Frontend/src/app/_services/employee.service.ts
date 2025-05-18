import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class EmployeeService {
    private apiUrl = `${environment.apiUrl}/employees`;

    constructor(private http: HttpClient) { }

    getAll() {
        return this.http.get<any[]>(this.apiUrl);
    }

    getById(id: string) {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    getNextEmployeeId() {
        return this.http.get<any>(`${this.apiUrl}/next-id`);
    }

    create(employee: any) {
        return this.http.post(this.apiUrl, employee);
    }

    update(id: string, employee: any) {
        return this.http.put(`${this.apiUrl}/${id}`, employee);
    }

    delete(id: string) {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }

    transfer(id: string, departmentId: string) {
        return this.http.post(`${this.apiUrl}/${id}/transfer`, { departmentId });
    }
} 