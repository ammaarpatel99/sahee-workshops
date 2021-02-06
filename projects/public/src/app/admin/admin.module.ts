import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import {WorkshopsDashboardModule} from '../workshops-dashboard/workshops-dashboard.module';
import {AdminWorkshopModule} from '../admin-workshop/admin-workshop.module';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AdminRoutingModule,
    WorkshopsDashboardModule,
    AdminWorkshopModule
  ]
})
export class AdminModule { }
