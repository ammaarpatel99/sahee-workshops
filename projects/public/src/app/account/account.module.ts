import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountComponent } from './account/account.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {NgxAuthFirebaseUIModule} from 'ngx-auth-firebaseui';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatButtonModule} from '@angular/material/button';
import {ReactiveFormsModule} from '@angular/forms';
import { AccountRoutingModule } from './account-routing.module';



@NgModule({
  declarations: [AccountComponent],
  imports: [
    CommonModule,
    AccountRoutingModule,
    MatExpansionModule,
    NgxAuthFirebaseUIModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    MatButtonModule
  ]
})
export class AccountModule { }
