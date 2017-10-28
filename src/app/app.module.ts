import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoutingModule } from './routing.module';
import { HttpClientModule }    from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';

import { AppComponent } from './app.component';
import { HomeComponent } from './home.component';
import { EventListComponent } from './event-list.component';
import { FeedbackComponent } from './feedback.component';
import { FeedbackService } from './feedback.service';
import { FaceDirective } from './feedback.component';
import { EventService } from './event.service';
import { InMemService } from './in-mem-api';

import { FeedbackListComponent } from './admin/feedback-list.component';
import { DebugComponent } from './admin/debug.component';
import { AdminService } from './admin/admin.service';

@NgModule({
  declarations: [
    FaceDirective,
    AppComponent,
    HomeComponent,
    EventListComponent,
    FeedbackComponent,
    // Admin components
    FeedbackListComponent,
    DebugComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RoutingModule,
    HttpClientModule,
    HttpClientInMemoryWebApiModule.forRoot(InMemService, { passThruUnknownUrl: true, delay: 0 }),
  ],
  providers: [EventService, FeedbackService, AdminService],
  bootstrap: [AppComponent]
})

export class AppModule { 

}
