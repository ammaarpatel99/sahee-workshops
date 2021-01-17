import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {FeedbackComponent} from './feedback/feedback.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: FeedbackComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FeedbackRoutingModule { }
