import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { Department } from './department.model';
import { DepartmentService } from './department.service';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-department-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit, OnDestroy {
  departments: Department[] = [];
  loading = false;
  errorMessage = '';
  private routerSubscription: Subscription;
  private retryCount = 0;
  private maxRetries = 3;

  constructor(
    private departmentService: DepartmentService,
    public accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    // Subscribe to router events
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // Reload departments when navigating to this page
      if (this.router.url === '/admin/departments') {
        this.loadDepartments();
      }
    });
  }

  ngOnInit() {
    this.loadDepartments();
  }

<<<<<<< HEAD
  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  loadDepartments() {
    this.loading = true;
    this.errorMessage = '';
    console.log('Loading departments...');
    
    this.departmentService.getDepartments().subscribe({
      next: (departments: Department[]) => {
        console.log('Departments loaded successfully:', departments);
        this.retryCount = 0; // Reset retry count on success
        
        if (Array.isArray(departments)) {
          this.departments = departments;
          console.log('Departments array set to:', this.departments);
          
          if (departments.length === 0) {
            this.errorMessage = 'No departments found. Click "Add Department" to create one.';
          } else {
            this.errorMessage = '';
          }
        } else {
          console.error('Invalid departments data:', departments);
          this.errorMessage = 'Invalid data received from server';
          this.departments = [];
        }
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading departments:', error);
        console.error('Error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText,
          error: error.error
        });
        
        this.retryCount++;
        
        if (this.retryCount < this.maxRetries) {
          console.log(`Retrying... Attempt ${this.retryCount} of ${this.maxRetries}`);
          setTimeout(() => this.loadDepartments(), 1000 * this.retryCount);
          } else {
            this.errorMessage = error.message || 'Error loading departments. Please try again.';
          this.loading = false;
          this.departments = [];
        }
      }
    });
  }
=======
loadDepartments() {
  this.departmentService.getDepartments().subscribe({
    next: (departments) => this.departments = departments,
    error: (error) => console.error('Error loading departments:', error)
  });
}
>>>>>>> 8849299aa24c52bb400af6d1b0bd3b5294c62c67

  retry() {
    this.retryCount = 0;
    this.loadDepartments();
  }

  account() {
    return this.accountService.accountValue;
  }

  add() {
    this.router.navigate(['./add'], { relativeTo: this.route });
  }

  edit(id: number) {
    this.router.navigate(['./edit', id], { relativeTo: this.route });
  }

  delete(id: number) {
    if (confirm('Are you sure you want to delete this department?')) {
      this.loading = true;
      this.departmentService.deleteDepartment(id).subscribe({
        next: () => {
          this.departments = this.departments.filter(x => x.id !== id);
          this.loading = false;
        },
        error: (error: any) => {
          console.error('Error deleting department:', error);
          this.errorMessage = error.message || 'Error deleting department. Please try again.';
          this.loading = false;
        }
      });
    }
  }
} 