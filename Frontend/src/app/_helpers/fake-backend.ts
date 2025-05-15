import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, materialize, dematerialize, mergeMap } from 'rxjs/operators';

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    users = [
        { id: 1, email: 'admin@admin.com', password: 'admin', role: 'Admin', title: 'Mr', firstName: 'Admin', lastName: 'User', isActive: true },
        { id: 2, email: 'user@user.com', password: 'user', role: 'User', title: 'Ms', firstName: 'Normal', lastName: 'User', isActive: true }
    ];
    employees: any[] = [];
    departments: any[] = [];
    workflows: any[] = [];
    requests: any[] = [];

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        return of(null)
            .pipe(mergeMap(() => this.handleRoute(url, method, headers, body, request, next)))
            .pipe(materialize())
            .pipe(delay(500))
            .pipe(dematerialize());
    }

    private handleRoute(url: string, method: string, headers: any, body: any, request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Accounts Routes
        if (url.endsWith('/accounts/authenticate') && method === 'POST') {
            const { email, password } = body;
            const user = this.users.find(u => u.email === email && u.password === password);
            if (!user) return throwError(() => new Error('Invalid credentials'));
            return of(new HttpResponse({ status: 200, body: { ...user, token: 'fake-jwt-token' } }));
        }

        if (url.endsWith('/accounts') && method === 'GET') {
            // Return accounts with expected properties for the frontend
            const accounts = this.users.map(u => ({
                id: u.id,
                title: u.title || '',
                firstName: u.firstName || (u.email === 'admin@admin.com' ? 'Admin' : 'User'),
                lastName: u.lastName || '',
                email: u.email,
                role: u.role,
                isActive: u.isActive !== false // default to true if not set
            }));
            return this.authorize(headers, 'Admin', () => of(new HttpResponse({ status: 200, body: accounts })));
        }

        if (url.match(/\/accounts\/\d+\/deactivate$/) && method === 'PUT') {
            return this.authorize(headers, 'Admin', () => {
                const id = parseInt(url.split('/')[url.split('/').length - 2]);
                const user = this.users.find(u => u.id === id);
                if (!user) return throwError(() => new Error('Account not found'));
                user.isActive = false;
                return of(new HttpResponse({ status: 200, body: { message: 'Account deactivated' } }));
            });
        }
        if (url.match(/\/accounts\/\d+\/activate$/) && method === 'PUT') {
            return this.authorize(headers, 'Admin', () => {
                const id = parseInt(url.split('/')[url.split('/').length - 2]);
                const user = this.users.find(u => u.id === id);
                if (!user) return throwError(() => new Error('Account not found'));
                user.isActive = true;
                return of(new HttpResponse({ status: 200, body: { message: 'Account activated' } }));
            });
        }

        // Employees Routes
        if (url.endsWith('/employees') && method === 'GET') {
            return this.authorize(headers, null, () => of(new HttpResponse({ status: 200, body: this.employees })));
        }

        if (url.endsWith('/employees') && method === 'POST') {
            return this.authorize(headers, 'Admin', () => {
                const employee = { id: this.employees.length + 1, ...body };
                this.employees.push(employee);
                return of(new HttpResponse({ status: 201, body: employee }));
            });
        }

        if (url.match(/\/employees\/\d+$/) && method === 'GET') {
            const id = parseInt(url.split('/').pop()!);
            const employee = this.employees.find(e => e.id === id);
            return this.authorize(headers, null, () => employee ? of(new HttpResponse({ status: 200, body: employee })) : throwError(() => new Error('Employee not found')));
        }

        if (url.match(/\/employees\/\d+$/) && method === 'PUT') {
            return this.authorize(headers, 'Admin', () => {
                const id = parseInt(url.split('/').pop()!);
                const employeeIndex = this.employees.findIndex(e => e.id === id);
                if (employeeIndex === -1) return throwError(() => new Error('Employee not found'));
                this.employees[employeeIndex] = { id, ...body };
                return of(new HttpResponse({ status: 200, body: this.employees[employeeIndex] }));
            });
        }

        if (url.match(/\/employees\/\d+$/) && method === 'DELETE') {
            return this.authorize(headers, 'Admin', () => {
                const id = parseInt(url.split('/').pop()!);
                this.employees = this.employees.filter(e => e.id !== id);
                return of(new HttpResponse({ status: 200, body: { message: 'Employee deleted' } }));
            });
        }

        if (url.match(/\/employees\/\d+\/transfer$/) && method === 'POST') {
            return this.authorize(headers, 'Admin', () => {
                const id = parseInt(url.split('/')[url.split('/').length - 2]);
                const employee = this.employees.find(e => e.id === id);
                if (!employee) return throwError(() => new Error('Employee not found'));
                employee.departmentId = body.departmentId;
                this.workflows.push({ id: this.workflows.length + 1, employeeId: id, type: 'Transfer', details: body, status: 'Pending' });
                return of(new HttpResponse({ status: 200, body: { message: 'Employee transferred' } }));
            });
        }

        // Departments Routes
        if (url.endsWith('/departments') && method === 'GET') {
            return this.authorize(headers, null, () => of(new HttpResponse({ status: 200, body: this.departments })));
        }

        if (url.endsWith('/departments') && method === 'POST') {
            return this.authorize(headers, 'Admin', () => {
                const department = { id: this.departments.length + 1, ...body, employeeCount: 0 };
                this.departments.push(department);
                return of(new HttpResponse({ status: 201, body: department }));
            });
        }

        if (url.match(/\/departments\/\d+$/) && method === 'PUT') {
            return this.authorize(headers, 'Admin', () => {
                const id = parseInt(url.split('/').pop()!);
                const deptIndex = this.departments.findIndex(d => d.id === id);
                if (deptIndex === -1) return throwError(() => new Error('Department not found'));
                this.departments[deptIndex] = { id, ...body, employeeCount: this.departments[deptIndex].employeeCount };
                return of(new HttpResponse({ status: 200, body: this.departments[deptIndex] }));
            });
        }

        if (url.match(/\/departments\/\d+$/) && method === 'DELETE') {
            return this.authorize(headers, 'Admin', () => {
                const id = parseInt(url.split('/').pop()!);
                this.departments = this.departments.filter(d => d.id !== id);
                return of(new HttpResponse({ status: 200, body: { message: 'Department deleted' } }));
            });
        }

        // Workflows Routes
        if (url.match(/\/workflows\/employee\/\d+$/) && method === 'GET') {
            return this.authorize(headers, null, () => {
                const employeeId = parseInt(url.split('/').pop()!);
                const workflows = this.workflows.filter(w => w.employeeId === employeeId);
                return of(new HttpResponse({ status: 200, body: workflows }));
            });
        }

        if (url.endsWith('/workflows') && method === 'POST') {
            return this.authorize(headers, 'Admin', () => {
                const workflow = { id: this.workflows.length + 1, ...body };
                this.workflows.push(workflow);
                return of(new HttpResponse({ status: 201, body: workflow }));
            });
        }

        // Requests Routes
        if (url.endsWith('/requests') && method === 'GET') {
            return this.authorize(headers, 'Admin', () => of(new HttpResponse({ status: 200, body: this.requests })));
        }

        if (url.endsWith('/requests') && method === 'POST') {
            return this.authorize(headers, null, () => {
                const request = { id: this.requests.length + 1, employeeId: this.getUser(headers)?.id, ...body };
                this.requests.push(request);
                return of(new HttpResponse({ status: 201, body: request }));
            });
        }

        if (url.match(/\/requests\/\d+$/) && method === 'PUT') {
            return this.authorize(headers, 'Admin', () => {
                const id = parseInt(url.split('/').pop()!);
                const reqIndex = this.requests.findIndex(r => r.id === id);
                if (reqIndex === -1) return throwError(() => new Error('Request not found'));
                this.requests[reqIndex] = { id, ...body };
                return of(new HttpResponse({ status: 200, body: this.requests[reqIndex] }));
            });
        }

        if (url.match(/\/requests\/\d+$/) && method === 'DELETE') {
            return this.authorize(headers, 'Admin', () => {
                const id = parseInt(url.split('/').pop()!);
                this.requests = this.requests.filter(r => r.id !== id);
                return of(new HttpResponse({ status: 200, body: { message: 'Request deleted' } }));
            });
        }

        return next.handle(request);
    }

    private authorize(headers: any, requiredRole: string | null, success: () => Observable<HttpEvent<any>>): Observable<HttpEvent<any>> {
        const user = this.getUser(headers);
        if (!user) return throwError(() => new Error('Unauthorized'));
        if (requiredRole && user.role !== requiredRole) return throwError(() => new Error('Forbidden'));
        return success();
    }

    private getUser(headers: any) {
        const authHeader = headers.get('Authorization');
        if (!authHeader || authHeader !== 'Bearer fake-jwt-token') return null;
        // For demo, always return the first user (admin) if the token is present
        return this.users[0];
    }
}

export const fakeBackendProvider = {
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};      