import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {WorkshopsDashboardComponent} from './workshops-dashboard/workshops-dashboard.component';
import {WorkshopComponent} from './workshop/workshop.component';
import {LoginComponent} from './login/login.component';
import {LatestWorkshopGuard} from './guards/latest-workshop/latest-workshop.guard';
import {LoginGuard} from './guards/login/login.guard';
import {LoggedInGuard} from './guards/logged-in/logged-in.guard';
import {AdminGuard} from './guards/admin/admin.guard';
import {WorkshopResolver} from './guards/workshop/workshop.resolver';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: WorkshopsDashboardComponent
  },
  {
    path: 'unknown',
    component: WorkshopsDashboardComponent,
    data: {unknown: true}
  },
  {
    path: 'latest',
    canActivate: [LatestWorkshopGuard],
    component: WorkshopComponent
  },
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
    path: 'support',
    loadChildren: () => import('./support/support.module').then(m => m.SupportModule)
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule),
    canLoad: [LoggedInGuard, AdminGuard],
    canActivate: [LoggedInGuard, AdminGuard],
    canActivateChild: [LoggedInGuard, AdminGuard]
  },
  {
    path: ':id',
    component: WorkshopComponent,
    resolve: {
      workshop$: WorkshopResolver
    }
  },
  {
    path: '**',
    redirectTo: '/unknown'
  }
];


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
