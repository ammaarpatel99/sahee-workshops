import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicWorkshopComponent } from './public-workshop/public-workshop.component';
import {MatDividerModule} from '@angular/material/divider';
import {MatButtonModule} from '@angular/material/button';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {FormsModule} from '@angular/forms';
import {WorkshopSignupModule} from '../workshop-signup/workshop-signup.module';
import { LatestComponent } from './latest/latest.component';
import {GetDownloadURLPipeModule} from '@angular/fire/storage';



@NgModule({
  declarations: [PublicWorkshopComponent, LatestComponent],
    imports: [
        CommonModule,
        MatDividerModule,
        MatButtonModule,
        MatSlideToggleModule,
        FormsModule,
        WorkshopSignupModule,
        GetDownloadURLPipeModule
    ],
  exports: [PublicWorkshopComponent, LatestComponent]
})
export class PublicWorkshopModule { }
