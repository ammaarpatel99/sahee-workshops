import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkshopComponent } from './workshop.component';
import {MatDividerModule} from '@angular/material/divider';
import {ReactiveFormsModule} from '@angular/forms';
import {MatStepperModule} from '@angular/material/stepper';
import {LoginModule} from '../login/login.module';
import {MatButtonModule} from '@angular/material/button';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {WorkshopSignupComponent} from './workshop-signup/workshop-signup.component';



@NgModule({
  declarations: [WorkshopComponent, WorkshopSignupComponent],
  imports: [
    CommonModule,
    MatDividerModule,
    ReactiveFormsModule,
    MatStepperModule,
    LoginModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  exports: [WorkshopComponent]
})
export class WorkshopModule { }
