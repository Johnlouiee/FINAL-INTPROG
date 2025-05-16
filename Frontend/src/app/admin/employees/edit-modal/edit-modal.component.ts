import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../../_services/department.service';
import { AccountService } from '../../../_services/account.service';
import { EmployeeService } from '../../../_services/employee.service';
import { first } from 'rxjs/operators';
import { AlertService } from '../../../_services/alert.service';

@Component({
  selector: 'app-edit-modal',
  templateUrl: './edit-modal.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class EditModalComponent implements OnInit {
  @Input() employee: any;
  @Output() close = new EventEmitter<void>();
  @Output() updated = new EventEmitter<void>();

  departments: any[] = [];
  accounts: any[] = [];
  selectedAccountId: string = '';
  selectedDepartmentId: string = '';
  selectedStatus: string = '';
  loading = false;
  error = '';

  constructor(
    private departmentService: DepartmentService,
    private accountService: AccountService,
    private employeeService: EmployeeService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadDepartments();
    this.loadAccounts();
    // Set initial values
    if (this.employee) {
      this.selectedAccountId = this.employee.userId;
      this.selectedDepartmentId = this.employee.departmentId;
      this.selectedStatus = this.employee.status;
    }
  }

  private loadDepartments() {
    this.departmentService.getAll()
      .pipe(first())
      .subscribe({
        next: (departments) => {
          this.departments = departments;
        },
        error: (error) => {
          this.error = 'Error loading departments';
          this.alertService.error('Error loading departments');
        }
      });
  }

  private loadAccounts() {
    this.accountService.getAll()
      .pipe(first())
      .subscribe({
        next: (accounts) => {
          this.accounts = accounts;
        },
        error: (error) => {
          this.error = 'Error loading accounts';
          this.alertService.error('Error loading accounts');
        }
      });
  }

  update() {
    if (!this.selectedAccountId || !this.selectedDepartmentId || !this.selectedStatus) {
      this.error = 'Please fill in all required fields';
      return;
    }

    this.loading = true;
    this.error = '';

    const updateData = {
      ...this.employee,
      userId: this.selectedAccountId,
      departmentId: this.selectedDepartmentId,
      status: this.selectedStatus
    };

    this.employeeService.update(this.employee.id, updateData)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Employee updated successfully');
          this.updated.emit();
          this.close.emit();
        },
        error: (error) => {
          this.error = error?.message || 'Error updating employee';
          this.alertService.error(this.error);
          this.loading = false;
        }
      });
  }

  closeModal() {
    this.close.emit();
  }
} 