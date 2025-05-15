import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../departments/department.service';
import { EmployeeService } from './employee.service';

@Component({
  selector: 'app-employee-transfer',
  templateUrl: './transfer.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class TransferComponent implements OnInit {
  id: string | null = null;
  employee: any = {};
  departments: any[] = [];
  departmentId: string = '';
  errorMessage = '';
  loading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    if (this.id) {
      this.loading = true;
      this.employeeService.getEmployee(this.id).subscribe({
        next: (emp) => {
          this.employee = emp;
          this.loading = false;
        },
        error: (err) => {
          this.errorMessage = 'Failed to load employee data';
          this.loading = false;
        }
      });
    }
    this.departmentService.getDepartments().subscribe({
      next: (departments) => { this.departments = departments; },
      error: (err) => { this.errorMessage = 'Failed to load departments'; }
    });
  }

  transfer() {
    if (!this.departmentId) {
      this.errorMessage = 'Please select a department';
      return;
    }
    this.loading = true;
    this.employeeService.updateEmployee(this.id!, { departmentId: this.departmentId }).subscribe({
      next: () => {
        this.router.navigate(['/admin/employees']);
      },
      error: (err) => {
        this.errorMessage = 'Failed to transfer employee';
        this.loading = false;
      }
    });
  }

  cancel() {
    this.router.navigate(['/admin/employees']);
  }
} 