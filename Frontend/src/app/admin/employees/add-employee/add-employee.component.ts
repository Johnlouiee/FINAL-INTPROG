import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { first } from 'rxjs/operators';
import { EmployeeService } from '../../../_services/employee.service';
import { DepartmentService } from '../../../_services/department.service';
import { AccountService } from '../../../_services/account.service';
import { AlertService } from '../../../_services/alert.service';

@Component({
    selector: 'app-add-employee',
    templateUrl: './add-employee.component.html'
})
export class AddEmployeeComponent implements OnInit {
    form!: FormGroup;
    loading = false;
    submitted = false;
    departments: any[] = [];
    accounts: any[] = [];

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
        this.form = this.formBuilder.group({
            employeeId: ['', [Validators.pattern('^[A-Za-z0-9]+$')]],
            accountId: ['', Validators.required],
            position: ['', Validators.required],
            departmentId: ['', Validators.required],
            hireDate: ['', Validators.required],
            status: ['active', Validators.required]
        });

        // Load departments and accounts
        this.loadDepartments();
        this.loadAccounts();
        this.loadNextEmployeeId();
    }

    private loadNextEmployeeId() {
        this.employeeService.getNextEmployeeId()
            .subscribe({
                next: (response) => {
                    this.form.patchValue({ employeeId: response.employeeId });
                },
                error: (error) => {
                    this.alertService.error('Error loading next employee ID');
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
        const employeeData = {
            ...this.form.value,
            userId: this.form.value.accountId
        };
        delete employeeData.accountId;

        this.employeeService.create(employeeData)
            .pipe(first())
            .subscribe({
                next: () => {
                    this.alertService.success('Employee added successfully');
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