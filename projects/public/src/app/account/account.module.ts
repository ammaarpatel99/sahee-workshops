import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountComponent } from './account/account.component';
import {MatExpansionModule} from '@angular/material/expansion';
import {NgxAuthFirebaseUIModule} from 'ngx-auth-firebaseui';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';



@NgModule({
  declarations: [AccountComponent],
  imports: [
    CommonModule,
    MatExpansionModule,
    NgxAuthFirebaseUIModule,
    MatSlideToggleModule,
    MatButtonModule,
    FormsModule
  ],
  exports: [AccountComponent]
})
export class AccountModule { }
