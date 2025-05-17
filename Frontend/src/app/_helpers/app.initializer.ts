import { AccountService } from '../_services/account.service';
import { ConfigService } from '../_services/config.service';

export function appInitializer(accountService: AccountService, configService: ConfigService) {
    return () => new Promise<void>(resolve => {
        console.log('App initializer started');
        
        // Load config first
        configService.loadConfig()
            .then((config) => {
                console.log('Config loaded, refreshing token');
                // Then refresh token
                accountService.refreshToken().subscribe({
                    next: () => {
                        console.log('Token refreshed successfully');
                        resolve();
                    },
                    error: (error) => {
                        console.error('Error refreshing token:', error);
                        resolve();
                    },
                    complete: () => {
                        console.log('Token refresh completed');
                        resolve();
                    }
                });
            })
            .catch((error) => {
                console.error('Error in app initializer:', error);
                resolve();
            });
    });
}

