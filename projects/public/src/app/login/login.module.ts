import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoginComponent } from './login.component';
import {NgxAuthFirebaseUIModule} from 'ngx-auth-firebaseui';



@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    NgxAuthFirebaseUIModule
  ],
  exports: [LoginComponent]
})
export class LoginModule { }
