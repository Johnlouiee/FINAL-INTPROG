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
        firstName: 'Admin',
        lastName: 'User',
        role: 'Admin',
        isVerified: true,
        isActive: true
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
                case url.match(/\/accounts\/\d+$/) && method === 'PUT':
                    return updateUser();
                case url.match(/\/accounts\/\d+$/) && method === 'DELETE':
                    return deleteUser();
                default:
                    // pass through any requests not handled above
                    return next.handle(request);
            }    
        }

        // route functions

        function authenticate() {
            const { email, password } = body;
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

            // For admin, don't include JWT token
            if (user.role === 'Admin') {
                return ok({
                    ...basicDetails(user)
                });
            }

            // For regular users, include JWT token
            return ok({
                ...basicDetails(user),
                jwtToken: `fake-jwt-token-${user.id}`
            });
        }

        function refreshToken() {
            const user = getUserFromToken();
            if (!user) {
                return unauthorized();
            }

            // For admin, don't include JWT token
            if (user.role === 'Admin') {
                return ok({
                    ...basicDetails(user)
                });
            }

            // For regular users, include JWT token
            return ok({
                ...basicDetails(user),
                jwtToken: `fake-jwt-token-${user.id}`
            });
        }

        function revokeToken() {
            return ok();
        }

        function register() {
            const user = body;

            if (users.find(x => x.email === user.email)) {
                return error('Email "' + user.email + '" is already registered');
            }

            user.id = users.length ? Math.max(...users.map(x => x.id)) + 1 : 1;
            user.isVerified = true; // Auto-verify for fake backend
            user.isActive = true;
            user.role = 'User';
            users.push(user);
            localStorage.setItem(usersKey, JSON.stringify(users));
            return ok();
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

        // helper functions

        function ok(body?: any) {
            return of(new HttpResponse({ status: 200, body }));
        }

        function error(message: string) {
            return throwError(() => ({ error: { message } }));
        }

        function unauthorized() {
            return throwError(() => ({ status: 401, error: { message: 'Unauthorized' } }));
        }

        function basicDetails(user: any) {
            const { id, email, firstName, lastName, role, isVerified, isActive } = user;
            return { id, email, firstName, lastName, role, isVerified, isActive };
        }

        function isLoggedIn() {
            const authHeader = headers.get('Authorization');
            if (!authHeader) return false;
            
            // Admin doesn't need token validation
            const user = getUserFromToken();
            if (user && user.role === 'Admin') return true;

            // For regular users, validate token
            const token = authHeader.split(' ')[1];
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

            // For admin, return admin user
            if (token === 'Bearer admin') {
                return users.find(x => x.role === 'Admin');
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