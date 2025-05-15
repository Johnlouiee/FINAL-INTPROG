import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeService } from '../../../_services/employee.service';
import { AlertService } from '../../../_services/alert.service';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
    employees: any[] = [];
    loading = false;

    constructor(
        private router: Router,
        private employeeService: EmployeeService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.loadEmployees();
    }

    private loadEmployees() {
        this.loading = true;
        this.employeeService.getAll()
            .subscribe({
                next: (employees: any[]) => {
                    this.employees = employees;
                    this.loading = false;
                },
                error: (error: any) => {
                    this.alertService.error(error);
                    this.loading = false;
                }
            });
    }

    viewRequests(employee: any) {
        this.router.navigate(['/admin/employees', employee.id, 'requests']);
    }

    viewWorkflows(employee: any) {
        this.router.navigate(['/admin/employees', employee.id, 'workflows']);
    }

    transferEmployee(employee: any) {
        this.router.navigate(['/admin/employees', employee.id, 'transfer']);
    }

    editEmployee(employee: any) {
        this.router.navigate(['/admin/employees', employee.id, 'edit']);
    }

    addEmployee() {
        this.router.navigate(['/admin/employees/add']);
    }
} 