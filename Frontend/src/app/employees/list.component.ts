import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AccountService } from '../_services/account.service';
// import { PaginationModule } from 'ngx-bootstrap/pagination';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmployeeService } from './employee.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './list.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class ListComponent implements OnInit {
  employees: any[] = [];
  loading = false;
  error = '';
  currentPage = 1;
  itemsPerPage = 10;
  totalItems = 0;

  constructor(
    private router: Router,
    private accountService: AccountService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit() {
    this.loadEmployees();
  }

  loadEmployees() {
    this.loading = true;
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        console.log('ListComponent: Employees loaded', employees);
        this.employees = employees;
        this.totalItems = employees.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('ListComponent: Failed to load employees', err);
        this.error = 'Failed to load employees: ' + (err?.message || err);
        this.loading = false;
      }
    });
  }

  account() {
    return this.accountService.accountValue;
  }

  addEmployee() {
    this.router.navigate(['/admin/employees/add']);
  }

  editEmployee(id: string) {
    this.router.navigate(['/admin/employees/edit', id]);
  }

  transfer(employee: any) {
    this.router.navigate(['/admin/employees/transfer', employee.id]);
  }

  viewRequests(id: string) {
    this.router.navigate(['/admin/requests', { employeeId: id }]);
  }

  viewWorkflows(id: string) {
    this.router.navigate(['/admin/workflows', { employeeId: id }]);
  }

  deleteEmployee(id: string) {
    if (confirm('Are you sure you want to delete this employee?')) {
      this.employeeService.deleteEmployee(id).subscribe({
        next: () => {
          this.employees = this.employees.filter(e => e.id !== id);
        },
        error: (err) => {
          this.error = 'Failed to delete employee: ' + (err?.message || err);
        }
      });
    }
  }

  pageChanged(event: any) {
    this.currentPage = event.page;
    this.loadEmployees();
  }
} 