import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkshopsDashboardComponent } from './workshops-dashboard/workshops-dashboard.component';
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
    ]
})
export class WorkshopsDashboardModule { }
