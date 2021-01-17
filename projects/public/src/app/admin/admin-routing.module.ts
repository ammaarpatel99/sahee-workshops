import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AdminWorkshopComponent} from './admin-workshop/admin-workshop/admin-workshop.component';
import {WorkshopsDashboardComponent} from '../workshops-dashboard/workshops-dashboard/workshops-dashboard.component';
import {AdminWorkshopResolver} from '../resolvers/admin-workshop/admin-workshop.resolver';
import {WorkshopDashboardResolver} from '../resolvers/workshop-dashboard/workshop-dashboard.resolver';

const routes: Routes = [
  {
    path: 'settings',
    loadChildren: () => import('./settings/settings.module').then(m => m.SettingsModule)
  },
  {
    path: '',
    pathMatch: 'full',
    component: WorkshopsDashboardComponent,
    data: {allowNew: true},
    resolve: {
      workshops$: WorkshopDashboardResolver
    }
  },
  {
    path: 'unknown',
    component: WorkshopsDashboardComponent,
    data: {unknown: true, allowNew: true},
    resolve: {
      workshops$: WorkshopDashboardResolver
    }
  },
  {
    path: 'new',
    component: AdminWorkshopComponent,
    data: {new: true}
  },
  {
    path: ':id',
    component: AdminWorkshopComponent,
    resolve: {
      workshop$: AdminWorkshopResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
