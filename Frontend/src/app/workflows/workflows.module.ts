import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListComponent } from './list.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: ListComponent }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes),
    ListComponent
  ]
})
export class WorkflowsModule { } 