import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { DepartmentService } from '../departments/department.service';
import { EmployeeService } from './employee.service';
import { AlertService } from '../_services/alert.service';

@Component({
  selector: 'app-employee-add-edit',
  templateUrl: './add-edit.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class AddEditComponent implements OnInit {
  id: string | null = null;
  employee: any = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    departmentId: '',
    hireDate: new Date().toISOString().split('T')[0],
    salary: 0
  };
  departments: any[] = [];
  errorMessage = '';
  loading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private departmentService: DepartmentService,
    private employeeService: EmployeeService,
    private alertService: AlertService
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
    
    // Load departments
    this.departmentService.getDepartments().subscribe({
      next: (departments) => { 
        this.departments = departments;
      },
      error: (err) => { 
        this.errorMessage = 'Failed to load departments';
      }
    });
  }

  save(form: NgForm) {
    // Stop here if form is invalid
    if (form.invalid) {
      this.errorMessage = 'Please fill in all required fields';
      return;
    }

    this.errorMessage = '';
    this.loading = true;

    // Log the form data for debugging
    console.log('Form data before submission:', this.employee);

    // Ensure all required fields are present and properly formatted
    const employeeData = {
      firstName: this.employee.firstName?.trim(),
      lastName: this.employee.lastName?.trim(),
      email: this.employee.email?.trim(),
      phone: this.employee.phone?.trim(),
      position: this.employee.position?.trim(),
      departmentId: this.employee.departmentId,
      hireDate: this.employee.hireDate,
      salary: parseFloat(this.employee.salary)
    };

    // Log the formatted data
    console.log('Formatted employee data:', employeeData);

    // Validate required fields
    if (!employeeData.firstName || !employeeData.lastName || !employeeData.email || 
        !employeeData.phone || !employeeData.position || !employeeData.departmentId || 
        !employeeData.hireDate || !employeeData.salary) {
      this.errorMessage = 'Please fill in all required fields';
      this.loading = false;
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employeeData.email)) {
      this.errorMessage = 'Please enter a valid email address';
      this.loading = false;
      return;
    }

    // Validate salary is a positive number
    if (isNaN(employeeData.salary) || employeeData.salary <= 0) {
      this.errorMessage = 'Please enter a valid salary amount';
      this.loading = false;
      return;
    }

    if (this.id) {
      this.employeeService.updateEmployee(this.id, employeeData).subscribe({
        next: () => {
          this.alertService.success('Employee updated successfully');
          this.router.navigate(['/admin/employees']);
        },
        error: (err) => {
          console.error('Update error:', err);
          this.errorMessage = err.error?.message || 'Failed to update employee';
          this.loading = false;
        }
      });
    } else {
      this.employeeService.createEmployee(employeeData).subscribe({
        next: () => {
          this.alertService.success('Employee created successfully');
          this.router.navigate(['/admin/employees']);
        },
        error: (err) => {
          console.error('Creation error:', err);
          this.errorMessage = err.error?.message || 'Failed to create employee';
          this.loading = false;
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/admin/employees']);
  }
} 