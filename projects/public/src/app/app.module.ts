import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {NavContainerModule} from './nav-container/nav-container.module';
import {AngularFireModule} from '@angular/fire';
import {environment} from '../environments/environment';
import {AngularFireAnalyticsModule, ScreenTrackingService, UserTrackingService} from '@angular/fire/analytics';
import {AngularFireAuthModule, USE_EMULATOR as USE_AUTH_EMULATOR} from '@angular/fire/auth';
import {AngularFirestoreModule, USE_EMULATOR as USE_FIRESTORE_EMULATOR} from '@angular/fire/firestore';
import {AngularFireStorageModule} from '@angular/fire/storage';
import {AngularFireFunctionsModule, USE_EMULATOR as USE_FUNCTIONS_EMULATOR} from '@angular/fire/functions';

import './firebase-initialisation/firebase-initialisation';
import {AngularFirePerformanceModule, PerformanceMonitoringService} from '@angular/fire/performance';

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
    ...ProductionProviders,
    { provide: USE_AUTH_EMULATOR, useValue: !environment.production ? ['localhost', 9099] : undefined },
    { provide: USE_FIRESTORE_EMULATOR, useValue: !environment.production ? ['localhost', 8080] : undefined },
    { provide: USE_FUNCTIONS_EMULATOR, useValue: !environment.production ? ['localhost', 5001] : undefined }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
