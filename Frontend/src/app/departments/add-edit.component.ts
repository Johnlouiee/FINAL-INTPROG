import { Component, OnInit } from '@angular/core';
<<<<<<< HEAD
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../_services/account.service';
=======
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
>>>>>>> 8849299aa24c52bb400af6d1b0bd3b5294c62c67
import { DepartmentService } from './department.service';
import { Department } from './department.model';

@Component({
  selector: 'app-add-edit-department',
  templateUrl: './add-edit.component.html'
})
export class AddEditComponent implements OnInit {
<<<<<<< HEAD
  id: string | null = null;
  department: Partial<Department> = {
    name: '',
    description: ''
  };
  errorMessage = '';
  loading = false;
=======
  form: FormGroup;
  id: number | null = null;
  isAddMode = true;
  loading = false;
  submitted = false;
>>>>>>> 8849299aa24c52bb400af6d1b0bd3b5294c62c67

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
<<<<<<< HEAD
    private accountService: AccountService,
    private departmentService: DepartmentService
  ) {}
=======
    private router: Router,
    private departmentService: DepartmentService
  ) {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }
>>>>>>> 8849299aa24c52bb400af6d1b0bd3b5294c62c67

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
<<<<<<< HEAD
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
=======
    this.isAddMode = !this.id;

    if (!this.isAddMode) {
      this.departmentService.getDepartment(this.id!).subscribe({
        next: (department) => this.form.patchValue(department),
        error: (error) => console.error('Error loading department:', error)
>>>>>>> 8849299aa24c52bb400af6d1b0bd3b5294c62c67
      });
    }
  }

<<<<<<< HEAD
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
=======
  get f() {
    return this.form.controls;
>>>>>>> 8849299aa24c52bb400af6d1b0bd3b5294c62c67
  }

  save(): void {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    const department: Department = this.form.value;

    if (this.isAddMode) {
      this.departmentService.createDepartment(department).subscribe({
        next: () => this.router.navigate(['/departments']),
        error: (error) => {
          console.error('Error creating department:', error);
          this.loading = false;
        }
      });
    } else {
      this.departmentService.updateDepartment(this.id!, department).subscribe({
        next: () => this.router.navigate(['/departments']),
        error: (error) => {
          console.error('Error updating department:', error);
          this.loading = false;
        }
      });
    }
  }
}
