// Core stuff
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoutingModule } from './routing.module';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';

// My components
import { AppComponent } from './app.component';
import { HomeComponent } from './home.component';
import { EventHistoryComponent } from './event-history.component';
import { EventListComponent } from './event-list.component';
import { FeedbackComponent } from './feedback.component';
import { FaceDirective } from './feedback.component';
import { ModalDialogComponent } from './modal-dialog.component';
import { EventService } from './event.service';
import { FeedbackService } from './feedback.service';
import { ConfigService } from './config.service';
import { InMemService } from './in-mem-api';
import { environment } from '../environments/environment';

// My components for admin
import { ReportComponent } from './admin/report.component';
import { AdminComponent } from './admin/admin.component';
import { UserService } from './admin/user.service';
import { AppSvcLogin } from './admin/app-svc-login.component';

@NgModule({
  declarations: [
    FaceDirective,
    AppComponent,
    HomeComponent,
    EventListComponent,
    EventHistoryComponent,
    FeedbackComponent,
    ModalDialogComponent,
    ReportComponent,
    AdminComponent,
    AppSvcLogin
  ],
  imports: [
    BrowserModule,
    FormsModule,
    RoutingModule,
    HttpClientModule,
    //HttpClientInMemoryWebApiModule.forRoot(InMemService, { passThruUnknownUrl: true, delay: 0 })
    !environment.production ? HttpClientInMemoryWebApiModule.forRoot(InMemService, { passThruUnknownUrl: true, delay: 0 }) : []
  ],
  providers: [
    EventService,
    FeedbackService,
    ConfigService,
    UserService,
    {
      provide: APP_INITIALIZER,
      useFactory: (config: any) => () => config.load(),
      deps: [ConfigService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {

}
