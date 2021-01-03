import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {WorkshopsDashboardComponent} from './workshops-dashboard/workshops-dashboard/workshops-dashboard.component';
import {PublicWorkshopComponent} from './public-workshop/public-workshop/public-workshop.component';
import {LoginComponent} from './login/login/login.component';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent
  },
  {
    path: 'workshops',
    children: [
      {
        path: '',
        component: WorkshopsDashboardComponent
      },
      {
        path: 'unknown',
        component: WorkshopsDashboardComponent,
        data: {unknown: true}
      },
      {
        path: ':id',
        component: PublicWorkshopComponent
      }
    ]
  },
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.module').then(m => m.AdminModule)
  },
  {
    path: '**',
    redirectTo: '/workshops'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
