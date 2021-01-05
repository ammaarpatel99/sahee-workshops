import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkshopSignupComponent } from './workshop-signup/workshop-signup.component';
import {MatButtonModule} from '@angular/material/button';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {FormsModule} from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';



@NgModule({
  declarations: [WorkshopSignupComponent],
    imports: [
        CommonModule,
        MatButtonModule,
        MatSlideToggleModule,
        FormsModule,
        MatProgressSpinnerModule
    ],
  exports: [WorkshopSignupComponent]
})
export class WorkshopSignupModule { }
