import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AccountService } from '../_services/account.service';

@Component({
  selector: 'app-department-add-edit',
  templateUrl: './add-edit.component.html'
})
export class AddEditComponent implements OnInit {
  id: string | null = null;
  department: any = {
    name: '',
    description: ''
  };
  errorMessage = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService
  ) {}

  ngOnInit() {
    this.id = this.route.snapshot.params['id'];
    if (this.id) {
      // TODO: Load department data
    }
  }

  save() {
    // TODO: Implement save logic
  }

  cancel() {
    this.router.navigate(['/admin/departments']);
  }
} 