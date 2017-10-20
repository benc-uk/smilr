import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RoutingModule } from './routing.module';

import { AppComponent } from './app.component';
import { HomeComponent }   from './home.component';
import { FeedbackComponent }   from './feedback.component';
import { FaceDirective }   from './feedback.component';

@NgModule({
  declarations: [
    FaceDirective,
    AppComponent,
    HomeComponent,
    FeedbackComponent
  ],
  imports: [
    BrowserModule,
    RoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { 

}
