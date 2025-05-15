import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Department } from './department.model';
import { DepartmentService } from './department.service';

@Component({
  selector: 'app-department-form',
  templateUrl: './department-form.component.html'
})
export class DepartmentFormComponent implements OnInit {
  form: FormGroup;
  id: number | null = null;
  isAddMode: boolean = true;
  loading = false;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private departmentService: DepartmentService
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
          this.loading = false;
        }
      });
    }
  }

  get f() { return this.form.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.loading = true;
    const department = this.form.value;

    if (this.isAddMode) {
      this.createDepartment(department);
    } else {
      this.updateDepartment(department);
    }
  }

  private createDepartment(department: Department) {
    this.departmentService.createDepartment(department).subscribe({
      next: () => {
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (error) => {
        console.error('Error creating department:', error);
        this.loading = false;
      }
    });
  }

  private updateDepartment(department: Department) {
    this.departmentService.updateDepartment(this.id!, department).subscribe({
      next: () => {
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: (error) => {
        console.error('Error updating department:', error);
        this.loading = false;
      }
    });
  }
} 