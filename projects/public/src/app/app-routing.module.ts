import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {WorkshopsDashboardComponent} from './workshops-dashboard/workshops-dashboard/workshops-dashboard.component';
import {PublicWorkshopComponent} from './public-workshop/public-workshop/public-workshop.component';
import {LoginComponent} from './login/login/login.component';
import {AccountComponent} from './account/account/account.component';
import {canActivate, redirectLoggedInTo, redirectUnauthorizedTo} from '@angular/fire/auth-guard';
import {LatestComponent} from './public-workshop/latest/latest.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    ...canActivate(() => redirectLoggedInTo('/workshops'))
  },
  {
    path: 'account',
    component: AccountComponent,
    ...canActivate(() => redirectUnauthorizedTo('/login'))
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: '',
    children: [
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
        component: LatestComponent
      },
      {
        path: ':id',
        component: PublicWorkshopComponent
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
