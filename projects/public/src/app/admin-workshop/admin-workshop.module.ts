import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminWorkshopComponent } from './admin-workshop.component';
import {MatTabsModule} from '@angular/material/tabs';
import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {ReactiveFormsModule} from '@angular/forms';
import {AdminWorkshopPromotionComponent} from './admin-workshop-promotion/admin-workshop-promotion.component';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {AdminWorkshopMessageComponent} from './admin-workshop-message/admin-workshop-message.component';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {AdminWorkshopDetailsFormComponent} from './admin-workshop-details-form/admin-workshop-details-form.component';
import {AdminWorkshopChangePosterComponent} from './admin-workshop-change-poster/admin-workshop-change-poster.component';
import {MatIconModule} from '@angular/material/icon';



@NgModule({
  declarations: [
    AdminWorkshopComponent,
    AdminWorkshopPromotionComponent,
    AdminWorkshopMessageComponent,
    AdminWorkshopDetailsFormComponent,
    AdminWorkshopChangePosterComponent
  ],
  imports: [
    CommonModule,
    MatCardModule,
    MatTabsModule,
    MatButtonModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatProgressBarModule,
    MatIconModule
  ],
  exports: [AdminWorkshopComponent]
})
export class AdminWorkshopModule { }
