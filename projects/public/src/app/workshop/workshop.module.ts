import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkshopComponent } from './workshop/workshop.component';
import {MatDividerModule} from '@angular/material/divider';
import {WorkshopSignupModule} from './workshop-signup/workshop-signup.module';



@NgModule({
  declarations: [WorkshopComponent],
  imports: [
    CommonModule,
    MatDividerModule,
    WorkshopSignupModule
  ],
  exports: [WorkshopComponent]
})
export class WorkshopModule { }
