import { AccountService } from '../_services/account.service';

export function appInitializer(accountService: AccountService) {
    return () => new Promise<void>(resolve => {
        accountService.refreshToken().subscribe({
            complete: resolve, //
            error: resolve
        });
    });
}

