import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkshopSignupComponent } from './workshop-signup/workshop-signup.component';
import {MatButtonModule} from '@angular/material/button';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {ReactiveFormsModule} from '@angular/forms';
import {MatStepperModule} from '@angular/material/stepper';
import {LoginModule} from '../../login/login.module';



@NgModule({
  declarations: [WorkshopSignupComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    LoginModule,
    MatButtonModule,
    MatSlideToggleModule
  ],
  exports: [WorkshopSignupComponent]
})
export class WorkshopSignupModule { }
