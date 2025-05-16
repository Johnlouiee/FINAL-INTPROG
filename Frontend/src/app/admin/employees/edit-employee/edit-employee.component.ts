import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { first } from 'rxjs/operators';
import { EmployeeService } from '../../../_services/employee.service';
import { DepartmentService } from '../../../_services/department.service';
import { AccountService } from '../../../_services/account.service';
import { AlertService } from '../../../_services/alert.service';

@Component({
    selector: 'app-edit-employee',
    templateUrl: './edit-employee.component.html',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule]
})
export class EditEmployeeComponent implements OnInit {
    form!: FormGroup;
    id!: string;
    loading = false;
    submitted = false;
    departments: any[] = [];
    accounts: any[] = [];
    employee: any;

    constructor(
        private formBuilder: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private employeeService: EmployeeService,
        private departmentService: DepartmentService,
        private accountService: AccountService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.id = this.route.snapshot.params['id'];

        this.form = this.formBuilder.group({
            accountId: ['', Validators.required],
            departmentId: ['', Validators.required],
            status: ['', Validators.required]
        });

        // Load departments and accounts
        this.loadDepartments();
        this.loadAccounts();
        this.loadEmployee();
    }

    private loadEmployee() {
        this.loading = true;
        this.employeeService.getById(this.id)
            .pipe(first())
            .subscribe({
                next: (employee) => {
                    this.employee = employee;
                    this.form.patchValue({
                        accountId: employee.userId,
                        departmentId: employee.departmentId,
                        status: employee.status
                    });
                    this.loading = false;
                },
                error: (error) => {
                    this.alertService.error('Error loading employee data');
                    this.loading = false;
                }
            });
    }

    private loadDepartments() {
        this.departmentService.getAll()
            .pipe(first())
            .subscribe({
                next: (departments) => {
                    this.departments = departments;
                },
                error: (error) => {
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
                    this.alertService.error('Error loading accounts');
                }
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
        const updateData = {
            ...this.employee,
            userId: this.form.value.accountId,
            departmentId: this.form.value.departmentId,
            status: this.form.value.status
        };

        this.employeeService.update(this.id, updateData)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Employee updated successfully');
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: (error) => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    cancel() {
        this.router.navigate(['../'], { relativeTo: this.route });
    }
} 