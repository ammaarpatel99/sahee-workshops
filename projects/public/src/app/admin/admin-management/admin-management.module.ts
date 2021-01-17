import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminManagementComponent } from './admin-management/admin-management.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatButtonModule} from '@angular/material/button';



@NgModule({
  declarations: [AdminManagementComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatButtonModule
  ],
  exports: [AdminManagementComponent]
})
export class AdminManagementModule { }
