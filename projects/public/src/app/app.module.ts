import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {NavContainerModule} from './nav-container/nav-container.module';
import {AngularFireModule} from '@angular/fire';
import {environment} from '../environments/environment';
import {AngularFireAnalyticsModule, ScreenTrackingService, UserTrackingService} from '@angular/fire/analytics';
import {AngularFireAuthModule} from '@angular/fire/auth';
import {AngularFirestoreModule} from '@angular/fire/firestore';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {AngularFireFunctionsModule} from '@angular/fire/functions';
import {AngularFirePerformanceModule, PerformanceMonitoringService} from '@angular/fire/performance';
import {WorkshopsDashboardModule} from './workshops-dashboard/workshops-dashboard.module';
import {PublicWorkshopModule} from './public-workshop/public-workshop.module';
import {LoginModule} from './login/login.module';
import {NgxAuthFirebaseUIModule} from 'ngx-auth-firebaseui';
import {AccountModule} from './account/account.module';

import './firebase-initialisation/firebase-initialisation';

const productionModules = [];
const ProductionProviders = [];
if (environment.production) {
  productionModules.push(
    AngularFireAnalyticsModule,
    AngularFirePerformanceModule
  );
  ProductionProviders.push(
    ScreenTrackingService,
    UserTrackingService,
    PerformanceMonitoringService
  );
}

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NavContainerModule,
    AngularFireModule.initializeApp(environment.firebase),
    ...productionModules,
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireFunctionsModule,
    WorkshopsDashboardModule,
    PublicWorkshopModule,
    LoginModule,
    AccountModule,
    NgxAuthFirebaseUIModule.forRoot(environment.firebase, undefined, {
      enableFirestoreSync: true, // enable/disable autosync users with firestore
      toastMessageOnAuthSuccess: true, // whether to open/show a snackbar message on auth success - default : true
      toastMessageOnAuthError: true, // whether to open/show a snackbar message on auth error - default : true
      enableEmailVerification: true, // default: true
    })
  ],
  providers: [
    ...ProductionProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
