import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {WorkshopsDashboardComponent} from './workshops-dashboard/workshops-dashboard/workshops-dashboard.component';
import {WorkshopComponent} from './workshop/workshop/workshop.component';
import {LoginComponent} from './login/login/login.component';
import {LatestWorkshopGuard} from './guards/latest-workshop/latest-workshop.guard';
import {LoginGuard} from './guards/login/login.guard';
import {LoggedInGuard} from './guards/logged-in/logged-in.guard';
import {AdminGuard} from './guards/admin/admin.guard';
import {WorkshopResolver} from './resolvers/workshop/workshop.resolver';
import {WorkshopDashboardResolver} from './resolvers/workshop-dashboard/workshop-dashboard.resolver';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [LoginGuard]
  },
  {
    path: 'account',
    loadChildren: () => import('./account/account.module').then(m => m.AccountModule),
    canLoad: [LoggedInGuard],
    canActivate: [LoggedInGuard],
    canActivateChild: [LoggedInGuard]
  },
  {
    path: 'feedback',
    loadChildren: () => import('./feedback/feedback.module').then(m => m.FeedbackModule)
  },
  /*{
    path: 'settings',
    loadChildren: () => import('./admin/settings/settings.module').then(m => m.SettingsModule)
  },*/
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canLoad: [LoggedInGuard, AdminGuard],
    canActivate: [LoggedInGuard, AdminGuard],
    canActivateChild: [LoggedInGuard, AdminGuard]
  },
  {
    path: '',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: WorkshopsDashboardComponent,
        resolve: {
          workshops$: WorkshopDashboardResolver
        }
      },
      {
        path: 'unknown',
        component: WorkshopsDashboardComponent,
        data: {unknown: true},
        resolve: {
          workshops$: WorkshopDashboardResolver
        }
      },
      {
        path: 'latest',
        canActivate: [LatestWorkshopGuard],
        component: WorkshopComponent
      },
      {
        path: ':id',
        component: WorkshopComponent,
        resolve: {
          workshop$: WorkshopResolver
        }
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
