import { NgModule }              from '@angular/core';
import { RouterModule, Routes }  from '@angular/router';

import { HomeComponent }         from './home.component';
import { TopicListComponent }    from './topic-list.component';
import { FeedbackComponent }     from './feedback.component';
import { FeedbackListComponent } from './feedback-list.component';
import { DebugComponent }        from './debug.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home',  component: HomeComponent },
  { path: 'topics',  component: TopicListComponent },
  { path: 'feedback/:topic',  component: FeedbackComponent },
  { path: 'feedback',  component: FeedbackListComponent, pathMatch: 'full' },
  { path: 'debug',  component: DebugComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class RoutingModule {}