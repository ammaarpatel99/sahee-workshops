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
import {AngularFireFunctionsModule, REGION} from '@angular/fire/functions';
import {AngularFirePerformanceModule, PerformanceMonitoringService} from '@angular/fire/performance';
import {WorkshopsDashboardModule} from './workshops-dashboard/workshops-dashboard.module';
import {WorkshopModule} from './workshop/workshop.module';
import {LoginModule} from './login/login.module';
import {NgxAuthFirebaseUIModule} from 'ngx-auth-firebaseui';

import './firebase-initialisation/firebase-initialisation';
import { ServiceWorkerModule } from '@angular/service-worker';

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
    AngularFireModule.initializeApp(environment.firebase),
    ...productionModules,
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireFunctionsModule,
    NavContainerModule,
    WorkshopsDashboardModule,
    WorkshopModule,
    LoginModule,
    NgxAuthFirebaseUIModule.forRoot(environment.firebase, undefined, {
      enableFirestoreSync: true, // enable/disable autosync users with firestore
      toastMessageOnAuthSuccess: true, // whether to open/show a snackbar message on auth success - default : true
      toastMessageOnAuthError: true, // whether to open/show a snackbar message on auth error - default : true
      enableEmailVerification: true, // default: true
    }),
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [
    ...ProductionProviders,
    {provide: REGION, useValue: 'europe-west2'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
