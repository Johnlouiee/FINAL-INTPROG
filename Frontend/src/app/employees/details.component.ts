import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EmployeeService } from './employee.service';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-employee-details',
  templateUrl: './details.component.html',
  standalone: true,
  imports: []
})
export class DetailsComponent implements OnInit {
  employee: any;
  workflows: any[] = [];
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private employeeService: EmployeeService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.employeeService.getEmployeeById(id).subscribe({
        next: (emp) => {
          this.employee = emp;
          this.fetchWorkflows(emp.id);
        },
        error: (err) => {
          this.error = 'Failed to load employee: ' + (err?.message || err);
          this.loading = false;
        }
      });
    }
  }

  fetchWorkflows(employeeId: string) {
    this.http.get<any[]>(`/api/workflows/employee/${employeeId}`).subscribe({
      next: (workflows) => {
        this.workflows = workflows;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load workflows: ' + (err?.message || err);
        this.loading = false;
      }
    });
  }
} 