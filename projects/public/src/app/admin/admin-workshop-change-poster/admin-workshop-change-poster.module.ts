import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminWorkshopChangePosterComponent } from './admin-workshop-change-poster/admin-workshop-change-poster.component';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatProgressBarModule} from '@angular/material/progress-bar';



@NgModule({
  declarations: [AdminWorkshopChangePosterComponent],
  imports: [
    CommonModule,
    MatButtonModule,
    MatInputModule,
    MatProgressBarModule
  ],
  exports: [AdminWorkshopChangePosterComponent]
})
export class AdminWorkshopChangePosterModule { }
