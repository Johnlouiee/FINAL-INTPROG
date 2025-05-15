import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { RequestService } from '../_services/request.service';
import { first } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-request-list',
  templateUrl: './list.component.html',
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class ListComponent implements OnInit {
  requests: any[] = [];
  loading = false;
  error = '';

  constructor(
    private router: Router,
    private accountService: AccountService,
    private requestService: RequestService
  ) {}

  ngOnInit() {
    this.loadRequests();
  }

  loadRequests() {
    this.loading = true;
    this.requestService.getAll()
      .pipe(first())
      .subscribe({
        next: (requests) => {
          this.requests = requests;
          this.loading = false;
        },
        error: (error) => {
          this.error = error;
          this.loading = false;
        }
      });
  }

  add() {
    this.router.navigate(['/admin/requests/add']);
  }

  edit(id: string) {
    this.router.navigate(['/admin/requests/edit', id]);
  }

  delete(id: string) {
    if (confirm('Are you sure you want to delete this request?')) {
      this.requestService.delete(id)
        .pipe(first())
        .subscribe({
          next: () => {
            this.requests = this.requests.filter(x => x.id !== id);
          },
          error: (error) => {
            this.error = error;
          }
        });
    }
  }

  account() {
    return this.accountService.accountValue;
  }
} 