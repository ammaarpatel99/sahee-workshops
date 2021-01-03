import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminWorkshopChangePosterComponent } from './admin-workshop-change-poster/admin-workshop-change-poster.component';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';



@NgModule({
  declarations: [AdminWorkshopChangePosterComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule
  ],
  exports: [AdminWorkshopChangePosterComponent]
})
export class AdminWorkshopChangePosterModule { }
