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
        console.log('Initializing AddEmployeeComponent');
        
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
                    console.log('Next employee ID:', response.employeeId);
                    this.form.patchValue({ employeeId: response.employeeId });
                },
                error: (error) => {
                    console.error('Error loading next employee ID:', error);
                    this.alertService.error('Error loading next employee ID');
                }
            });
    }

    private loadDepartments() {
        this.departmentService.getAll()
            .pipe(first())
            .subscribe({
                next: (departments: any[]) => {
                    console.log('Loaded departments:', departments);
                    this.departments = departments;
                },
                error: (error: any) => {
                    console.error('Error loading departments:', error);
                    this.alertService.error('Error loading departments');
                }
            });
    }

    private loadAccounts() {
        this.accountService.getAll()
            .pipe(first())
            .subscribe({
                next: (accounts: any[]) => {
                    console.log('Loaded accounts:', accounts);
                    this.accounts = accounts;
                },
                error: (error: any) => {
                    console.error('Error loading accounts:', error);
                    this.alertService.error('Error loading accounts');
                }
            });
    }

    // convenience getter for easy access to form fields
    get f() { return this.form.controls; }

    onSubmit() {
        this.submitted = true;
        console.log('Form submitted:', this.form.value);

        // reset alerts on submit
        this.alertService.clear();

        // stop here if form is invalid
        if (this.form.invalid) {
            console.log('Form is invalid:', this.form.errors);
            return;
        }

        this.loading = true;
        this.employeeService.create(this.form.value)
            .pipe(first())
            .subscribe({
                next: () => {
                    console.log('Employee created successfully');
                    this.alertService.success('Employee added successfully', { keepAfterRouteChange: true });
                    this.router.navigate(['../'], { relativeTo: this.route });
                },
                error: (error: any) => {
                    console.error('Error creating employee:', error);
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    cancel() {
        this.router.navigate(['../'], { relativeTo: this.route });
    }
} 