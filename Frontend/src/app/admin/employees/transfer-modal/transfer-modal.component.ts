import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DepartmentService } from '../../../_services/department.service';
import { EmployeeService } from '../../../_services/employee.service';
import { first } from 'rxjs/operators';
import { AlertService } from '../../../_services/alert.service';

@Component({
  selector: 'app-transfer-modal',
  templateUrl: './transfer-modal.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class TransferModalComponent implements OnInit {
  @Input() employee: any;
  @Output() close = new EventEmitter<void>();
  @Output() transferred = new EventEmitter<void>();

  departments: any[] = [];
  selectedDepartmentId: string = '';
  loading = false;
  error = '';

  constructor(
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.loadDepartments();
    // Set initial department ID
    if (this.employee?.departmentId) {
      this.selectedDepartmentId = this.employee.departmentId;
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

  transfer() {
    if (!this.selectedDepartmentId) {
      this.error = 'Please select a department';
      return;
    }

    if (this.selectedDepartmentId === this.employee.departmentId) {
      this.error = 'Please select a different department';
      return;
    }

    this.loading = true;
    this.error = '';

    const updateData = {
      ...this.employee,
      departmentId: this.selectedDepartmentId
    };

    this.employeeService.update(this.employee.id, updateData)
      .pipe(first())
      .subscribe({
        next: () => {
          this.alertService.success('Employee transferred successfully');
          this.transferred.emit();
          this.close.emit();
        },
        error: (error) => {
          this.error = error?.message || 'Error transferring employee';
          this.alertService.error(this.error);
          this.loading = false;
        }
      });
  }

  closeModal() {
    this.close.emit();
  }
} 