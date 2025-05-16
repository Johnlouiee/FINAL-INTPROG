import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AccountService } from '../_services/account.service';
import { RequestService } from '../_services/request.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { EmployeeService } from '../employees/employee.service';

@Component({
  selector: 'app-request-add-edit',
  templateUrl: './add-edit.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule]
})
export class AddEditComponent implements OnInit {
  id?: string;
  loading = false;
  errorMessage = '';
  employees: any[] = [];
  request: any = {
    type: '',
    employeeId: '',
    description: ''
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private requestService: RequestService,
    private accountService: AccountService,
    private employeeService: EmployeeService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    
    // Load employees
    this.employeeService.getEmployees().subscribe({
      next: (employees) => {
        this.employees = employees;
      },
      error: (err) => {
        console.error('Failed to load employees', err);
        this.errorMessage = 'Failed to load employees';
      }
    });
    
    if (this.id) {
      this.loading = true;
      this.requestService.getById(this.id)
        .subscribe({
          next: (data) => {
            this.request = data;
            this.loading = false;
          },
          error: (error) => {
            this.errorMessage = error;
            this.loading = false;
          }
        });
    }
  }

  addItem() {
    this.request.requestItems.push({
      name: '',
      quantity: 1
    });
  }

  removeItem(index: number) {
    this.request.requestItems.splice(index, 1);
  }

  save() {
    this.errorMessage = '';
    
    // Validate request
    if (!this.request.type) {
      this.errorMessage = 'Type is required';
      return;
    }
    if (!this.request.employeeId) {
      this.errorMessage = 'Employee is required';
      return;
    }
    if (!this.request.requestItems || this.request.requestItems.length === 0) {
      this.errorMessage = 'At least one item is required';
      return;
    }
    
    // Validate items
    for (const item of this.request.requestItems) {
      if (!item.name) {
        this.errorMessage = 'Item name is required';
        return;
      }
      if (!item.quantity || item.quantity < 1) {
        this.errorMessage = 'Item quantity must be at least 1';
        return;
      }
    }

    this.loading = true;

    if (this.id) {
      this.requestService.update(this.id, this.request)
        .subscribe({
          next: () => {
            this.router.navigate(['/admin/requests']);
          },
          error: (error) => {
            console.error('Update error:', error);
            this.errorMessage = error;
            this.loading = false;
          }
        });
    } else {
      this.requestService.create(this.request)
        .subscribe({
          next: () => {
            this.router.navigate(['/admin/requests']);
          },
          error: (error) => {
            console.error('Save error:', error);
            this.errorMessage = error;
            this.loading = false;
          }
        });
    }
  }

  cancel() {
    this.router.navigate(['/admin/requests']);
  }
} 