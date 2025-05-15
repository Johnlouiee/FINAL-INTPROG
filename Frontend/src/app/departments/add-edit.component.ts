import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DepartmentService } from './department.service';
import { Department } from './department.model';

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

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    this.isAddMode = !this.id;

    if (!this.isAddMode) {
      this.departmentService.getDepartment(this.id!).subscribe({
        next: (department) => this.form.patchValue(department),
        error: (error) => console.error('Error loading department:', error)
      });
    }
  }

  get f() {
    return this.form.controls;
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
