import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminWorkshopPromotionComponent } from './admin-workshop-promotion/admin-workshop-promotion.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {ReactiveFormsModule} from '@angular/forms';
import {MatButtonModule} from '@angular/material/button';



@NgModule({
  declarations: [AdminWorkshopPromotionComponent],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule
  ],
  exports: [AdminWorkshopPromotionComponent]
})
export class AdminWorkshopPromotionModule { }
