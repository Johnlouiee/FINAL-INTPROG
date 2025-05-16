import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartmentService } from './department.service';
import { Department } from './department.model';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-add-edit-department',
  templateUrl: './add-edit.component.html'
})
export class AddEditComponent implements OnInit {
  form: FormGroup;
  id: number | null = null;
  isAddMode = true;
  loading = false;
  submitted = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService,
    private accountService: AccountService
  ) {
    this.form = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    this.isAddMode = !this.id;

    if (!this.isAddMode) {
      this.loading = true;
      this.departmentService.getDepartment(this.id!).subscribe({
        next: (department) => {
          this.form.patchValue(department);
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading department:', error);
          this.errorMessage = 'Error loading department.';
          this.loading = false;
        }
      });
    }
  }

  get f() {
    return this.form.controls;
  }

  save() {
    this.submitted = true;
    this.errorMessage = '';

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    const department = this.form.value;

    if (this.isAddMode) {
      this.departmentService.createDepartment(department).subscribe({
        next: () => {
          this.router.navigate(['/admin/departments']);
        },
        error: (error) => {
          console.error('Error creating department:', error);
          this.errorMessage = 'Error creating department.';
          this.loading = false;
        }
      });
    } else {
      this.departmentService.updateDepartment(this.id!, department).subscribe({
        next: () => {
          this.router.navigate(['/admin/departments']);
        },
        error: (error) => {
          console.error('Error updating department:', error);
          this.errorMessage = 'Error updating department.';
          this.loading = false;
        }
      });
    }
  }

  cancel() {
    this.router.navigate(['/admin/departments']);
  }
}
