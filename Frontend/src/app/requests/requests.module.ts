import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListComponent } from './list.component';
import { AddEditComponent } from './add-edit.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: ListComponent },
  { path: 'add', component: AddEditComponent },
  { path: 'edit/:id', component: AddEditComponent }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    RouterModule.forChild(routes)
  ]
})
export class RequestsModule { } 