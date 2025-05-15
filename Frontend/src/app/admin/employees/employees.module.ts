import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { EmployeesRoutingModule } from './employees-routing.module';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { ListComponent } from './list/list.component';

@NgModule({
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        EmployeesRoutingModule
    ],
    declarations: [
        AddEmployeeComponent,
        ListComponent
    ]
})
export class EmployeesModule { } 