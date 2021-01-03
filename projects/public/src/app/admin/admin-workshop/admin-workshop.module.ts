import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminWorkshopComponent } from './admin-workshop/admin-workshop.component';
import {MatTabsModule} from '@angular/material/tabs';
import {AdminWorkshopDetailsFormModule} from '../admin-workshop-details-form/admin-workshop-details-form.module';
import {MatCardModule} from '@angular/material/card';
import {AdminWorkshopChangePosterModule} from '../admin-workshop-change-poster/admin-workshop-change-poster.module';
import {AdminWorkshopPromotionModule} from '../admin-workshop-promotion/admin-workshop-promotion.module';
import {AdminWorkshopMessageModule} from '../admin-workshop-message/admin-workshop-message.module';



@NgModule({
  declarations: [AdminWorkshopComponent],
  imports: [
    CommonModule,
    AdminWorkshopDetailsFormModule,
    AdminWorkshopChangePosterModule,
    AdminWorkshopPromotionModule,
    AdminWorkshopMessageModule,
    MatCardModule,
    MatTabsModule
  ],
  exports: [AdminWorkshopComponent]
})
export class AdminWorkshopModule { }
