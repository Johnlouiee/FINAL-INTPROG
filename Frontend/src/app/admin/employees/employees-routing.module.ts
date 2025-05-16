import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddEmployeeComponent } from './add-employee/add-employee.component';
import { ListComponent } from './list/list.component';
import { EditEmployeeComponent } from './edit-employee/edit-employee.component';

const routes: Routes = [
    { path: '', component: ListComponent },
    { path: 'add', component: AddEmployeeComponent },
    { path: 'edit/:id', component: EditEmployeeComponent }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class EmployeesRoutingModule { } 