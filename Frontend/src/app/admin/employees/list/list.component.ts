import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { EmployeeService } from '../../../_services/employee.service';
import { AlertService } from '../../../_services/alert.service';
import { TransferModalComponent } from '../transfer-modal/transfer-modal.component';
import { EditModalComponent } from '../edit-modal/edit-modal.component';

@Component({
    selector: 'app-list',
    templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
    employees: any[] = [];
    loading = false;
    showTransferModal = false;
    showEditModal = false;
    selectedEmployee: any = null;

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
        this.router.navigate(['/admin/requests'], { queryParams: { employeeId: employee.id } });
    }

    viewWorkflows(employee: any) {
        this.router.navigate(['/admin/workflows'], { queryParams: { employeeId: employee.id } });
    }

    openTransferModal(employee: any) {
        this.selectedEmployee = employee;
        this.showTransferModal = true;
    }

    closeTransferModal() {
        this.showTransferModal = false;
        this.selectedEmployee = null;
    }

    openEditModal(employee: any) {
        this.selectedEmployee = employee;
        this.showEditModal = true;
    }

    closeEditModal() {
        this.showEditModal = false;
        this.selectedEmployee = null;
    }

    onTransferComplete() {
        this.loadEmployees();
        this.closeTransferModal();
    }

    onEditComplete() {
        this.loadEmployees();
        this.closeEditModal();
    }

    addEmployee() {
        this.router.navigate(['/admin/employees/add']);
    }
}