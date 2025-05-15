import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-workflow-list',
  templateUrl: './list.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class ListComponent implements OnInit {
  workflows: any[] = [];
  employeeId: string | null = null;
  loading = false;
  error = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.employeeId = this.route.snapshot.params['employeeId'];
    this.loadWorkflows();
  }

  loadWorkflows() {
    this.loading = true;
    // TODO: Implement workflow loading logic
    this.loading = false;
  }

  account() {
    return this.accountService.accountValue;
  }

  approve(id: string) {
    // TODO: Implement approve logic
  }

  reject(id: string) {
    // TODO: Implement reject logic
  }
} 