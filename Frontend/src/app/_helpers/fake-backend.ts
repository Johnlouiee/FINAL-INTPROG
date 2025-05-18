import { Injectable } from '@angular/core';
import { HttpRequest, HttpResponse, HttpHandler, HttpEvent, HttpInterceptor, HTTP_INTERCEPTORS } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, mergeMap, materialize, dematerialize } from 'rxjs/operators';

// array in local storage for registered users
const usersKey = 'angular-10-jwt-refresh-token-users';
let users: any[] = JSON.parse(localStorage.getItem(usersKey)!) || [
    {
        id: 1,
        email: 'admin@admin.com',
        password: 'admin',
        title: 'Mr',
        firstName: 'Admin',
        lastName: 'User',
        acceptTerms: true,
        role: 'Admin',
        verificationToken: null,
        verified: new Date(),
        resetToken: null,
        resetTokenExpires: null,
        passwordReset: null,
        created: new Date(),
        updated: new Date(),
        isActive: true,
        isVerified: true
    }
];

// array in local storage for departments
const departmentsKey = 'angular-departments';
let departments: any[] = JSON.parse(localStorage.getItem(departmentsKey)!) || [
    {
        id: 1,
        name: 'IT',
        description: 'Information Technology Department',
        manager: 'John Doe',
        location: 'Main Office',
        created: new Date(),
        updated: new Date(),
        isActive: true
    },
    {
        id: 2,
        name: 'HR',
        description: 'Human Resources Department',
        manager: 'Jane Smith',
        location: 'Main Office',
        created: new Date(),
        updated: new Date(),
        isActive: true
    }
];

// array in local storage for employees
const employeesKey = 'angular-employees';
let employees: any[] = JSON.parse(localStorage.getItem(employeesKey)!) || [
    {
        id: 1,
        employeeId: 'EMP001',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@company.com',
        phone: '123-456-7890',
        departmentId: 1,
        position: 'Senior Developer',
        hireDate: new Date('2023-01-15'),
        salary: 75000,
        status: 'Active',
        created: new Date(),
        updated: new Date()
    },
    {
        id: 2,
        employeeId: 'EMP002',
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@company.com',
        phone: '123-456-7891',
        departmentId: 2,
        position: 'HR Manager',
        hireDate: new Date('2023-02-01'),
        salary: 85000,
        status: 'Active',
        created: new Date(),
        updated: new Date()
    }
];

@Injectable()
export class FakeBackendInterceptor implements HttpInterceptor {
    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        const { url, method, headers, body } = request;

        // wrap in delayed observable to simulate server api call
        return of(null)
            .pipe(mergeMap(handleRoute))
            .pipe(materialize()) // call materialize and dematerialize to ensure delay even if an error is thrown
            .pipe(delay(500))
            .pipe(dematerialize());

        function handleRoute() {
            switch (true) {
                case url.endsWith('/accounts/authenticate') && method === 'POST':
                    return authenticate();
                case url.endsWith('/accounts/refresh-token') && method === 'POST':
                    return refreshToken();
                case url.endsWith('/accounts/revoke-token') && method === 'POST':
                    return revokeToken();
                case url.endsWith('/accounts/register') && method === 'POST':
                    return register();
                case url.endsWith('/accounts/verify-email') && method === 'POST':
                    return verifyEmail();
                case url.endsWith('/accounts/forgot-password') && method === 'POST':
                    return forgotPassword();
                case url.endsWith('/accounts/validate-reset-token') && method === 'POST':
                    return validateResetToken();
                case url.endsWith('/accounts/reset-password') && method === 'POST':
                    return resetPassword();
                case url.endsWith('/accounts') && method === 'GET':
                    return getUsers();
                case url.match(/\/accounts\/\d+$/) && method === 'GET':
                    return getUserById();
                case url.match(/\/accounts\/profile$/) && method === 'GET':
                    return getProfile();
                case url.match(/\/accounts\/\d+$/) && method === 'PUT':
                    return updateUser();
                case url.match(/\/accounts\/\d+$/) && method === 'DELETE':
                    return deleteUser();
                // Employee routes
                case url.endsWith('/employees') && method === 'GET':
                    return getEmployees();
                case url.match(/\/employees\/\d+$/) && method === 'GET':
                    return getEmployeeById();
                case url.endsWith('/employees') && method === 'POST':
                    return createEmployee();
                case url.match(/\/employees\/\d+$/) && method === 'PUT':
                    return updateEmployee();
                case url.match(/\/employees\/\d+$/) && method === 'DELETE':
                    return deleteEmployee();
                // Department routes
                case url.endsWith('/departments') && method === 'GET':
                    return getDepartments();
                case url.match(/\/departments\/\d+$/) && method === 'GET':
                    return getDepartmentById();
                case url.endsWith('/departments') && method === 'POST':
                    return createDepartment();
                case url.match(/\/departments\/\d+$/) && method === 'PUT':
                    return updateDepartment();
                case url.match(/\/departments\/\d+$/) && method === 'DELETE':
                    return deleteDepartment();
                // Request routes
                case url.endsWith('/requests') && method === 'GET':
                    return getRequests();
                case url.match(/\/requests\/\d+$/) && method === 'GET':
                    return getRequestById();
                case url.endsWith('/requests') && method === 'POST':
                    return createRequest();
                case url.match(/\/requests\/\d+$/) && method === 'PUT':
                    return updateRequest();
                case url.match(/\/requests\/\d+$/) && method === 'DELETE':
                    return deleteRequest();
                // Workflow routes
                case url.endsWith('/workflows') && method === 'GET':
                    return getWorkflows();
                case url.match(/\/workflows\/\d+$/) && method === 'GET':
                    return getWorkflowById();
                case url.endsWith('/workflows') && method === 'POST':
                    return createWorkflow();
                case url.match(/\/workflows\/\d+$/) && method === 'PUT':
                    return updateWorkflow();
                case url.match(/\/workflows\/\d+$/) && method === 'DELETE':
                    return deleteWorkflow();
                // Add new route for employee transfer
                case url.match(/\/employees\/\d+\/transfer$/) && method === 'POST':
                    return transferEmployee();
                // Add new route for getting next employee ID
                case url.endsWith('/employees/next-id') && method === 'GET':
                    return getNextEmployeeId();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }    
        }

        // route functions

        function authenticate() {
            const { email, password } = body;
            
            // Special handling for admin login - direct database check
            if (email === 'admin@admin.com' && password === 'admin123') {
                const response = {
                    id: 1,
                    email: 'admin@admin.com',
                    title: 'Mr',
                    firstName: 'Admin',
                    lastName: 'User',
                    role: 'Admin',
                    isVerified: true,
                    isActive: true,
                    // Use a special admin token that never expires
                    jwtToken: 'admin-token-permanent'
                };
                return ok(response);
            }

            // Handle regular user login with JWT token
            const user = users.find(x => x.email === email && x.password === password);
            if (!user) {
                return error('Email or password is incorrect');
            }

            if (!user.isVerified) {
                return error('Email not verified');
            }

            if (!user.isActive) {
                return error('Account is deactivated');
            }

            const response = {
                id: user.id,
                email: user.email,
                title: user.title,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isVerified: user.isVerified,
                isActive: user.isActive,
                jwtToken: `fake-jwt-token-${user.id}`
            };
            return ok(response);
        }

        function refreshToken() {
            const user = getUserFromToken();
            if (!user) {
                return unauthorized();
            }

            // For admin, return admin user with permanent token
            if (user.role === 'Admin') {
                return ok({
                    id: user.id,
                    email: user.email,
                    title: user.title,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    role: user.role,
                    isVerified: user.isVerified,
                    isActive: user.isActive,
                    jwtToken: 'admin-token-permanent'
                });
            }

            // For regular users, include JWT token
            return ok({
                id: user.id,
                email: user.email,
                title: user.title,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isVerified: user.isVerified,
                isActive: user.isActive,
                jwtToken: `fake-jwt-token-${user.id}`
            });
        }

        function revokeToken() {
            // Don't revoke admin token
            const user = getUserFromToken();
            if (user && user.role === 'Admin') {
                return ok();
            }
            return ok();
        }

        function register() {
            const user = body;

            if (users.find(x => x.email === user.email)) {
                return error('Email "' + user.email + '" is already registered');
            }

            // Generate new user id
            user.id = users.length ? Math.max(...users.map(x => x.id)) + 1 : 1;
            
            // Set default values for new users
            user.isVerified = true; // Auto-verify for fake backend
            user.isActive = true;
            user.role = 'User'; // All registered users are regular users
            user.created = new Date();
            user.updated = new Date();
            user.verificationToken = null;
            user.verified = new Date();
            user.resetToken = null;
            user.resetTokenExpires = null;
            user.passwordReset = null;
            
            // Add new user to array
            users.push(user);
            
            // Save updated users array to local storage
            localStorage.setItem(usersKey, JSON.stringify(users));
            
            return ok({
                id: user.id,
                email: user.email,
                title: user.title,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isVerified: user.isVerified,
                isActive: user.isActive
            });
        }

        function verifyEmail() {
            return ok();
        }

        function forgotPassword() {
            return ok();
        }

        function validateResetToken() {
            return ok();
        }

        function resetPassword() {
            return ok();
        }

        function getUsers() {
            if (!isLoggedIn()) return unauthorized();
            return ok(users.map(x => basicDetails(x)));
        }

        function getUserById() {
            if (!isLoggedIn()) return unauthorized();

            const user = users.find(x => x.id === idFromUrl());
            if (!user) return error('User not found');
            return ok(basicDetails(user));
        }

        function updateUser() {
            if (!isLoggedIn()) return unauthorized();

            let params = body;
            let user = users.find(x => x.id === idFromUrl());
            if (!user) return error('User not found');

            // only update password if entered
            if (!params.password) {
                delete params.password;
            }

            // update and save user
            Object.assign(user, params);
            localStorage.setItem(usersKey, JSON.stringify(users));

            return ok();
        }

        function deleteUser() {
            if (!isLoggedIn()) return unauthorized();

            users = users.filter(x => x.id !== idFromUrl());
            localStorage.setItem(usersKey, JSON.stringify(users));
            return ok();
        }

        function getProfile() {
            if (!isLoggedIn()) return unauthorized();

            const user = getUserFromToken();
            if (!user) return unauthorized();

            return ok({
                id: user.id,
                email: user.email,
                title: user.title,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isVerified: user.isVerified,
                isActive: user.isActive
            });
        }

        // Employee functions
        function getEmployees() {
            if (!isLoggedIn()) return unauthorized();
            
            // Map employees to include department names
            const employeesWithDepartments = employees.map(employee => {
                const department = departments.find(d => d.id === employee.departmentId);
                return {
                    ...employee,
                    departmentName: department ? department.name : 'Unknown'
                };
            });
            
            return ok(employeesWithDepartments);
        }

        function getEmployeeById() {
            if (!isLoggedIn()) return unauthorized();

            const employee = employees.find(x => x.id === idFromUrl());
            if (!employee) return error('Employee not found');

            // Include department information
            const department = departments.find(d => d.id === employee.departmentId);
            const employeeWithDepartment = {
                ...employee,
                departmentName: department ? department.name : 'Unknown'
            };

            return ok(employeeWithDepartment);
        }

        function getNextEmployeeId() {
            if (!isLoggedIn()) return unauthorized();

            try {
                // Get the highest employee ID number
                const highestId = employees.reduce((max, employee) => {
                    const currentId = parseInt(employee.employeeId.replace('EMP', ''));
                    return currentId > max ? currentId : max;
                }, 0);

                // Generate next ID
                const nextId = highestId + 1;
                const nextEmployeeId = `EMP${String(nextId).padStart(3, '0')}`;

                return ok({
                    nextId: nextId,
                    nextEmployeeId: nextEmployeeId
                });
            } catch (err: any) {
                return error('Error generating next employee ID: ' + (err.message || 'Unknown error'));
            }
        }

        function createEmployee() {
            // Check if user is logged in and has appropriate role
            const user = getUserFromToken();
            if (!user) return unauthorized();
            
            // Allow Admin and HR roles to create employees
            if (user.role !== 'Admin' && user.role !== 'HR') {
                return error('You do not have permission to create employees');
            }

            const employee = body;

            // Validate required fields
            if (!employee.firstName || !employee.lastName || !employee.email || !employee.departmentId) {
                return error('Required fields are missing');
            }

            // Check if email already exists
            if (employees.find(x => x.email.toLowerCase() === employee.email.toLowerCase())) {
                return error('Email already exists');
            }

            try {
                // Get the highest employee ID number
                const highestId = employees.reduce((max, employee) => {
                    const currentId = parseInt(employee.employeeId.replace('EMP', ''));
                    return currentId > max ? currentId : max;
                }, 0);

                // Generate new IDs
                const newId = highestId + 1;
                const employeeId = `EMP${String(newId).padStart(3, '0')}`;

                // Validate department exists
                const department = departments.find(d => d.id === employee.departmentId);
                if (!department) {
                    return error('Invalid department');
                }

                // Set default values
                employee.id = newId;
                employee.employeeId = employeeId;
                employee.status = 'Active';
                employee.created = new Date();
                employee.updated = new Date();

                // Add new employee to array
                employees.push(employee);
                
                // Save updated employees array to local storage
                localStorage.setItem(employeesKey, JSON.stringify(employees));
                
                return ok(employee);
            } catch (err: any) {
                return error('Error creating employee: ' + (err.message || 'Unknown error'));
            }
        }

        function updateEmployee() {
            // Check if user is logged in and has appropriate role
            const user = getUserFromToken();
            if (!user) return unauthorized();
            
            // Allow Admin and HR roles to update employees
            if (user.role !== 'Admin' && user.role !== 'HR') {
                return error('You do not have permission to update employees');
            }

            const params = body;
            const employee = employees.find(x => x.id === idFromUrl());
            
            if (!employee) {
                return error('Employee not found');
            }

            // Check if email is being changed and if it conflicts with existing email
            if (params.email && params.email !== employee.email) {
                if (employees.find(x => x.email.toLowerCase() === params.email.toLowerCase())) {
                    return error('Email already exists');
                }
            }

            // If department is being changed, validate it exists
            if (params.departmentId && params.departmentId !== employee.departmentId) {
                const department = departments.find(d => d.id === params.departmentId);
                if (!department) {
                    return error('Invalid department');
                }
            }

            // Update employee
            Object.assign(employee, params);
            employee.updated = new Date();

            // Save updated employees array to local storage
            localStorage.setItem(employeesKey, JSON.stringify(employees));

            return ok(employee);
        }

        function deleteEmployee() {
            // Check if user is logged in and has appropriate role
            const user = getUserFromToken();
            if (!user) return unauthorized();
            
            // Only Admin can delete employees
            if (user.role !== 'Admin') {
                return error('You do not have permission to delete employees');
            }

            const employee = employees.find(x => x.id === idFromUrl());
            if (!employee) {
                return error('Employee not found');
            }

            // Remove employee from array
            employees = employees.filter(x => x.id !== idFromUrl());
            
            // Save updated employees array to local storage
            localStorage.setItem(employeesKey, JSON.stringify(employees));
            
            return ok();
        }

        // Department functions
        function getDepartments() {
            if (!isLoggedIn()) return unauthorized();
            return ok(departments);
        }

        function getDepartmentById() {
            if (!isLoggedIn()) return unauthorized();

            const department = departments.find(x => x.id === idFromUrl());
            if (!department) return error('Department not found');
            return ok(department);
        }

        function createDepartment() {
            if (!isLoggedIn()) return unauthorized();

            const department = body;

            // Validate required fields
            if (!department.name) {
                return error('Department name is required');
            }

            // Check if department name already exists
            if (departments.find(x => x.name.toLowerCase() === department.name.toLowerCase())) {
                return error('Department name already exists');
            }

            // Generate new department id
            department.id = departments.length ? Math.max(...departments.map(x => x.id)) + 1 : 1;
            
            // Set default values
            department.created = new Date();
            department.updated = new Date();
            department.isActive = true;

            // Add new department to array
            departments.push(department);
            
            // Save updated departments array to local storage
            localStorage.setItem(departmentsKey, JSON.stringify(departments));
            
            return ok(department);
        }

        function updateDepartment() {
            if (!isLoggedIn()) return unauthorized();

            const params = body;
            const department = departments.find(x => x.id === idFromUrl());
            
            if (!department) {
                return error('Department not found');
            }

            // Check if new name conflicts with existing department
            if (params.name && params.name !== department.name) {
                if (departments.find(x => x.name.toLowerCase() === params.name.toLowerCase())) {
                    return error('Department name already exists');
                }
            }

            // Update department
            Object.assign(department, params);
            department.updated = new Date();

            // Save updated departments array to local storage
            localStorage.setItem(departmentsKey, JSON.stringify(departments));

            return ok(department);
        }

        function deleteDepartment() {
            if (!isLoggedIn()) return unauthorized();

            const department = departments.find(x => x.id === idFromUrl());
            if (!department) {
                return error('Department not found');
            }

            // Remove department from array
            departments = departments.filter(x => x.id !== idFromUrl());
            
            // Save updated departments array to local storage
            localStorage.setItem(departmentsKey, JSON.stringify(departments));
            
            return ok();
        }

        // Request functions
        function getRequests() {
            if (!isLoggedIn()) return unauthorized();
            return ok([
                { 
                    id: 1, 
                    title: 'Leave Request', 
                    type: 'Leave',
                    status: 'Pending',
                    requester: 'John Doe',
                    department: 'IT',
                    dateSubmitted: new Date().toISOString()
                },
                { 
                    id: 2, 
                    title: 'Equipment Request', 
                    type: 'Equipment',
                    status: 'Approved',
                    requester: 'Jane Smith',
                    department: 'HR',
                    dateSubmitted: new Date().toISOString()
                }
            ]);
        }

        function getRequestById() {
            if (!isLoggedIn()) return unauthorized();
            return ok({ 
                id: 1, 
                title: 'Leave Request', 
                type: 'Leave',
                status: 'Pending',
                requester: 'John Doe',
                department: 'IT',
                dateSubmitted: new Date().toISOString(),
                details: 'Annual leave request for 5 days'
            });
        }

        function createRequest() {
            if (!isLoggedIn()) return unauthorized();
            return ok(body);
        }

        function updateRequest() {
            if (!isLoggedIn()) return unauthorized();
            return ok(body);
        }

        function deleteRequest() {
            if (!isLoggedIn()) return unauthorized();
            return ok();
        }

        // Workflow functions
        function getWorkflows() {
            if (!isLoggedIn()) return unauthorized();
            return ok([
                { 
                    id: 1, 
                    name: 'Leave Approval', 
                    type: 'Leave',
                    status: 'Active',
                    steps: [
                        { id: 1, name: 'Submit Request', role: 'Employee' },
                        { id: 2, name: 'Manager Approval', role: 'Manager' },
                        { id: 3, name: 'HR Review', role: 'HR' }
                    ]
                },
                { 
                    id: 2, 
                    name: 'Equipment Request', 
                    type: 'Equipment',
                    status: 'Active',
                    steps: [
                        { id: 1, name: 'Submit Request', role: 'Employee' },
                        { id: 2, name: 'IT Review', role: 'IT' },
                        { id: 3, name: 'Manager Approval', role: 'Manager' }
                    ]
                }
            ]);
        }

        function getWorkflowById() {
            if (!isLoggedIn()) return unauthorized();
            return ok({ 
                id: 1, 
                name: 'Leave Approval', 
                type: 'Leave',
                status: 'Active',
                steps: [
                    { id: 1, name: 'Submit Request', role: 'Employee' },
                    { id: 2, name: 'Manager Approval', role: 'Manager' },
                    { id: 3, name: 'HR Review', role: 'HR' }
                ]
            });
        }

        function createWorkflow() {
            if (!isLoggedIn()) return unauthorized();
            return ok(body);
        }

        function updateWorkflow() {
            if (!isLoggedIn()) return unauthorized();
            return ok(body);
        }

        function deleteWorkflow() {
            if (!isLoggedIn()) return unauthorized();
            return ok();
        }

        // Add new route for employee transfer
        function transferEmployee() {
            // Check if user is logged in and has appropriate role
            const user = getUserFromToken();
            if (!user) return unauthorized();
            
            // Allow Admin and HR roles to transfer employees
            if (user.role !== 'Admin' && user.role !== 'HR') {
                return error('You do not have permission to transfer employees');
            }

            const employeeId = idFromUrl();
            const { newDepartmentId, transferDate, reason } = body;

            const employee = employees.find(x => x.id === employeeId);
            if (!employee) {
                return error('Employee not found');
            }

            // Validate new department exists
            const department = departments.find(d => d.id === newDepartmentId);
            if (!department) {
                return error('Invalid department');
            }

            // Create transfer record
            const transfer = {
                id: Date.now(),
                employeeId: employee.id,
                oldDepartmentId: employee.departmentId,
                newDepartmentId: newDepartmentId,
                transferDate: transferDate || new Date(),
                reason: reason || 'Department transfer',
                status: 'Completed',
                created: new Date()
            };

            // Update employee's department
            employee.departmentId = newDepartmentId;
            employee.updated = new Date();

            // Save updated employees array to local storage
            localStorage.setItem(employeesKey, JSON.stringify(employees));

            return ok({
                employee,
                transfer
            });
        }

        // helper functions

        function ok(body?: any) {
            return of(new HttpResponse({ 
                status: 200, 
                body,
                statusText: 'OK'
            }));
        }

        function error(message: string) {
            return throwError(() => ({
                status: 400,
                error: { message },
                statusText: 'Bad Request'
            }));
        }

        function unauthorized() {
            return throwError(() => ({
                status: 401,
                error: { message: 'Unauthorized' },
                statusText: 'Unauthorized'
            }));
        }

        function basicDetails(user: any) {
            const { id, email, title, firstName, lastName, role, isVerified, isActive } = user;
            return { id, email, title, firstName, lastName, role, isVerified, isActive };
        }

        function isLoggedIn() {
            const authHeader = headers.get('Authorization');
            if (!authHeader) return false;
            
            const token = authHeader.split(' ')[1];
            if (!token) return false;

            // Special handling for admin token - always valid
            if (token === 'admin-token-permanent') return true;

            // For regular users, validate token
            return users.some(x => x.role !== 'Admin' && `fake-jwt-token-${x.id}` === token);
        }

        function idFromUrl() {
            const urlParts = url.split('/');
            return parseInt(urlParts[urlParts.length - 1]);
        }

        function getUserFromToken() {
            const authHeader = headers.get('Authorization');
            if (!authHeader) return null;
            
            const token = authHeader.split(' ')[1];
            if (!token) return null;

            // For admin, return admin user directly
            if (token === 'admin-token-permanent') {
                return {
                    id: 1,
                    email: 'admin@admin.com',
                    title: 'Mr',
                    firstName: 'Admin',
                    lastName: 'User',
                    role: 'Admin',
                    isVerified: true,
                    isActive: true
                };
            }

            // For regular users, find by token
            return users.find(x => `fake-jwt-token-${x.id}` === token);
        }
    }
}

export const fakeBackendProvider = {
    // use fake backend in place of Http service for backend-less development
    provide: HTTP_INTERCEPTORS,
    useClass: FakeBackendInterceptor,
    multi: true
};      