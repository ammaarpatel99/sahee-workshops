import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminWorkshopComponent} from './admin-workshop/admin-workshop/admin-workshop.component';
import {WorkshopsDashboardComponent} from '../workshops-dashboard/workshops-dashboard/workshops-dashboard.component';
import {canActivate, hasCustomClaim} from '@angular/fire/auth-guard';
import {AdminManagementComponent} from './admin-management/admin-management/admin-management.component';

const routes: Routes = [
  {
    path: 'workshops',
    ...canActivate(() => hasCustomClaim('admin')),
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: WorkshopsDashboardComponent,
        data: {allowNew: true}
      },
      {
        path: 'unknown',
        component: WorkshopsDashboardComponent,
        data: {unknown: true, allowNew: true}
      },
      {
        path: 'new',
        component: AdminWorkshopComponent,
        data: {new: true}
      },
      {
        path: ':id',
        component: AdminWorkshopComponent
      }
    ]
  },
  {
    path: 'manage',
    component: AdminManagementComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/admin/workshops'
  },
  {
    path: '**',
    redirectTo: '/'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
