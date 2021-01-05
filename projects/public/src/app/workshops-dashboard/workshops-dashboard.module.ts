import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WorkshopsDashboardComponent } from './workshops-dashboard/workshops-dashboard.component';
import {MatCardModule} from '@angular/material/card';
import {RouterModule} from '@angular/router';
import {MatButtonModule} from '@angular/material/button';
import {GetDownloadURLPipeModule} from '@angular/fire/storage';



@NgModule({
  declarations: [WorkshopsDashboardComponent],
    imports: [
        CommonModule,
        MatCardModule,
        RouterModule,
        MatButtonModule,
        GetDownloadURLPipeModule
    ]
})
export class WorkshopsDashboardModule { }
