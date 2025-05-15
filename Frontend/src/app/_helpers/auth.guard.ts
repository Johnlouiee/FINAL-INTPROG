import { Injectable } from '@angular/core';
import { Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { Role } from '../_models/role';

@Injectable({ providedIn: 'root' })
export class AuthGuard {
    constructor(
        private router: Router,
        private accountService: AccountService
    ) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        const account = this.accountService.accountValue;
        console.log('Auth Guard - Full Account Object:', JSON.stringify(account, null, 2));
        console.log('Auth Guard - JWT Token:', account?.jwtToken);
        console.log('Auth Guard - Role:', account?.role);
        console.log('Auth Guard - Role.Admin:', Role.Admin);
        
        if (!account) {
            console.log('Auth Guard - No account, redirecting to login');
            this.router.navigate(['/accounts/login']);
            return false;
        }
        // Check for admin role
        if (account.role !== Role.Admin && state.url.includes('/admin')) {
            console.log('Auth Guard - Not admin, redirecting to home');
            this.router.navigate(['/']);
            return false;
        }
        console.log('Auth Guard - Access granted');
        return true;
    }
}
