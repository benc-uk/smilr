// Core stuff
import { BrowserModule } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RoutingModule } from './routing.module';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientInMemoryWebApiModule } from 'angular-in-memory-web-api';

// My components & services
import { AppComponent } from './app.component';
import { SideNavComponent } from './side-nav.component';
import { HomeComponent } from './home.component';
import { EventHistoryComponent } from './event-history.component';
import { EventListComponent } from './event-list.component';
import { FeedbackComponent } from './feedback.component';
import { AboutComponent } from './about.component';
import { FaceDirective } from './feedback.component';
import { ModalDialogComponent } from './modal-dialog.component';
import { EventService } from './event.service';
import { FeedbackService } from './feedback.service';
import { ConfigService } from './config.service';
import { InMemService } from './in-mem-api';
import { environment } from '../environments/environment';

// My components & services for admin
import { ReportComponent } from './admin/report.component';
import { AdminComponent } from './admin/admin.component';
import { UserService } from './admin/user.service';
import { AppSvcLogin } from './admin/app-svc-login.component';

@NgModule({
  declarations: [
    FaceDirective,
    AppComponent,
    SideNavComponent,
    HomeComponent,
    EventListComponent,
    EventHistoryComponent,
    FeedbackComponent,
    AboutComponent,
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
    // This is *SUPER* important & only enables the memory API off when not production mode
    !environment.production ? HttpClientInMemoryWebApiModule.forRoot(InMemService, {delay: 0}) : []
  ],
  providers: [
    EventService,
    FeedbackService,
    UserService,
    // This bizzare code is the only way to have a service load at startup
    // Only working example on the internet https://gist.github.com/fernandohu/122e88c3bcd210bbe41c608c36306db9
    ConfigService,
    {
      provide: APP_INITIALIZER,
      useFactory: cfg => () => cfg.loadConfig().then(cfg.startUpNotice()),
      deps: [ConfigService],
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
