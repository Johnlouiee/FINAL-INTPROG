import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { EmployeeService } from '../../../_services/employee.service';
import { DepartmentService } from '../../../_services/department.service';
import { AlertService } from '../../../_services/alert.service';

@Component({
    selector: 'app-transfer',
    templateUrl: './transfer.component.html'
})
export class TransferComponent implements OnInit {
    form!: FormGroup;
    id: string = '';
    loading = false;
    submitted = false;
    departments: any[] = [];
    employee: any;

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        public router: Router,
        private employeeService: EmployeeService,
        private departmentService: DepartmentService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];
        
        this.form = this.formBuilder.group({
            departmentId: ['', Validators.required]
        });

        // Load employee details
        this.employeeService.getById(this.id)
            .pipe(first())
            .subscribe(employee => {
                this.employee = employee;
                this.form.patchValue({
                    departmentId: employee.departmentId
                });
            });

        // Load departments
        this.departmentService.getAll()
            .pipe(first())
            .subscribe(departments => {
                this.departments = departments;
            });
    }

    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        this.alertService.clear();

        if (this.form.invalid) {
            return;
        }

        this.loading = true;
        this.employeeService.transfer(this.id, this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Employee transferred successfully');
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: error => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    cancel() {
        this.router.navigate(['../'], { relativeTo: this.route });
    }
} 