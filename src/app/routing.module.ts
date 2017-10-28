import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';

import { HomeComponent }         from './home.component';
import { EventListComponent }    from './event-list.component';
import { FeedbackComponent }     from './feedback.component';

import { FeedbackListComponent } from './admin/feedback-list.component';
import { DebugComponent }        from './admin/debug.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home',  component: HomeComponent },
  { path: 'events',  component: EventListComponent },
  { path: 'feedback/:eventid/:topicid',  component: FeedbackComponent },
  { path: 'admin/debug',  component: DebugComponent },
  { path: 'admin/report',  component: FeedbackListComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class RoutingModule {}