import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkshopsDashboardComponent } from './workshops-dashboard.component';
import {MatCardModule} from '@angular/material/card';
import {RouterModule} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';



@NgModule({
  declarations: [WorkshopsDashboardComponent],
    imports: [
        CommonModule,
        MatCardModule,
        RouterModule,
        MatButtonModule
    ],
  exports: [WorkshopsDashboardComponent]
})
export class WorkshopsDashboardModule { }
