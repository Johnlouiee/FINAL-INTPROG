import { AccountService } from '../_services/account.service';
import { ConfigService } from '../_services/config.service';

export function appInitializer(accountService: AccountService, configService: ConfigService) {
    return () => new Promise<void>(resolve => {
        // Load config first
        configService.loadConfig()
            .then(() => {
                // Then refresh token
                accountService.refreshToken().subscribe({
                    complete: resolve,
                    error: resolve
                });
            })
            .catch(() => resolve());
    });
}

