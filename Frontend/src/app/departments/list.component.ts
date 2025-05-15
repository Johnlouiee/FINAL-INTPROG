import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Department } from './department.model';
import { DepartmentService } from './department.service';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-department-list',
  templateUrl: './list.component.html'
})
export class ListComponent implements OnInit {
  departments: Department[] = [];
  loading = false;

  constructor(
    private departmentService: DepartmentService,
    public accountService: AccountService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.loadDepartments();
  }

  loadDepartments() {
    this.loading = true;
    this.departmentService.getDepartments().subscribe({
      next: (departments: Department[]) => {
        this.departments = departments;
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Error loading departments:', error);
        this.loading = false;
      }
    });
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
      this.departmentService.deleteDepartment(id).subscribe({
        next: () => {
          this.departments = this.departments.filter(x => x.id !== id);
        },
        error: (error: any) => {
          console.error('Error deleting department:', error);
        }
      });
    }
  }
} 