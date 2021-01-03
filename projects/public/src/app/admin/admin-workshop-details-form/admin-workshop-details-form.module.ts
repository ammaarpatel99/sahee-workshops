import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminWorkshopDetailsFormComponent } from './admin-workshop-details-form/admin-workshop-details-form.component';
import {ReactiveFormsModule} from '@angular/forms';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatButtonModule} from '@angular/material/button';



@NgModule({
  declarations: [AdminWorkshopDetailsFormComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatTooltipModule,
    MatButtonModule
  ],
  exports: [AdminWorkshopDetailsFormComponent]
})
export class AdminWorkshopDetailsFormModule { }
