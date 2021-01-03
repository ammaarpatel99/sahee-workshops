import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminManagementComponent } from './admin-management/admin-management.component';
import {FormsModule} from '@angular/forms';



@NgModule({
  declarations: [AdminManagementComponent],
  imports: [
    CommonModule,
    FormsModule
  ],
  exports: [AdminManagementComponent]
})
export class AdminManagementModule { }
