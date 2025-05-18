import { Component, OnInit } from '@angular/core';
import { AccountService } from '../_services/account.service';
import { Account } from '../_models/account';

@Component({ 
    selector: 'app-home',
    templateUrl: 'home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    account: Account | null = null;
    loading = true;

    constructor(private accountService: AccountService) { }

    ngOnInit() {
        // Subscribe to account changes
        this.accountService.account.subscribe(account => {
            this.account = account;
            this.loading = false;
        });
    }
}
