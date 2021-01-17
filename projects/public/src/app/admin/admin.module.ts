import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AdminRoutingModule } from './admin-routing.module';
import {AdminWorkshopModule} from './admin-workshop/admin-workshop.module';
import {WorkshopsDashboardModule} from '../workshops-dashboard/workshops-dashboard.module';


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
