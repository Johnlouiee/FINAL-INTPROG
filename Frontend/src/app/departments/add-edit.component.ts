import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { DepartmentService } from './department.service';
import { Department } from './department.model';

@Component({
  selector: 'app-department-add-edit',
  templateUrl: './add-edit.component.html'
})
export class AddEditComponent implements OnInit {
  id: string | null = null;
  department: Partial<Department> = {
    name: '',
    description: ''
  };
  errorMessage = '';
  loading = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private departmentService: DepartmentService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    if (this.id) {
      this.loading = true;
      this.departmentService.getDepartment(+this.id).subscribe({
        next: (dept) => {
          this.department = dept;
          this.loading = false;
        },
        error: (err) => {
          console.error('Error loading department:', err);
          this.errorMessage = 'Error loading department.';
          this.loading = false;
        }
      });
    }
  }

  save() {
    this.errorMessage = '';
    this.loading = true;

    // Validate form
    if (!this.department.name) {
      this.errorMessage = 'Name is required.';
      this.loading = false;
      return;
    }

    if (this.id) {
      // Update existing department
      this.departmentService.updateDepartment(+this.id, this.department).subscribe({
        next: () => {
          this.loading = false;
          this.router.navigate(['/admin/departments']);
        },
        error: (err) => {
          console.error('Error updating department:', err);
          this.errorMessage = 'Error updating department.';
          this.loading = false;
        }
      });
    } else {
      // Create new department
      console.log('Creating department:', this.department);
      this.departmentService.createDepartment(this.department).subscribe({
        next: (response) => {
          console.log('Department created successfully:', response);
          this.loading = false;
          this.router.navigate(['/admin/departments']);
        },
        error: (err) => {
          console.error('Error creating department:', err);
          this.errorMessage = 'Error creating department. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/admin/departments']);
  }
} 