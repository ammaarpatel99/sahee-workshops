import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminWorkshopMessageComponent } from './admin-workshop-message/admin-workshop-message.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatButtonModule} from '@angular/material/button';



@NgModule({
  declarations: [AdminWorkshopMessageComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatSlideToggleModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  exports: [AdminWorkshopMessageComponent]
})
export class AdminWorkshopMessageModule { }
