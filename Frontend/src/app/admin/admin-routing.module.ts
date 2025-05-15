import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SubNavComponent } from './subnav.component';
import { LayoutComponent } from './layout.component';
import { OverviewComponent } from './overview.component';

const accountsModule = () => import('./accounts/accounts.module').then(x => x.AccountsModule);
const departmentsModule = () => import('../departments/departments.module').then(x => x.DepartmentsModule);
const requestsModule = () => import('../requests/requests.module').then(x => x.RequestsModule);
const workflowsModule = () => import('../workflows/workflows.module').then(x => x.WorkflowsModule);
const employeesRoutes = () => import('../employees/employees.routes').then(x => x.routes);

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: OverviewComponent },
      { path: 'accounts', loadChildren: accountsModule },
      { path: 'employees', loadChildren: employeesRoutes },
      { path: 'departments', loadChildren: departmentsModule },
      { path: 'requests', loadChildren: requestsModule },
      { path: 'workflows', loadChildren: workflowsModule }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }