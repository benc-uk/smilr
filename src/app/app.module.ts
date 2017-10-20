import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoutingModule } from './routing.module';
import { HttpClientModule }    from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';

import { AppComponent } from './app.component';
import { HomeComponent } from './home.component';
import { TopicListComponent } from './topic-list.component';
import { FeedbackComponent } from './feedback.component';
import { FeedbackListComponent } from './feedback-list.component';
import { FeedbackService } from './feedback.service';
import { FaceDirective } from './feedback.component';
import { TopicService } from './topic.service';
import { InMemService } from './in-mem-api';

@NgModule({
  declarations: [
    FaceDirective,
    AppComponent,
    HomeComponent,
    TopicListComponent,
    FeedbackComponent,
    FeedbackListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RoutingModule,
    HttpClientModule,
    HttpClientInMemoryWebApiModule.forRoot(InMemService, { passThruUnknownUrl: true }),
  ],
  providers: [TopicService, FeedbackService],
  bootstrap: [AppComponent]
})
export class AppModule { 

}
