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
    AngularFireModule.initializeApp(environment.firebase, 'public'),
    ...productionModules,
    AngularFireAuthModule,
    AngularFirestoreModule,
    AngularFireStorageModule,
    AngularFireFunctionsModule
  ],
  providers: [
    ...ProductionProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
