import { Component } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';

import { EventService } from './event.service';
import { Event } from './models/event';

@Component({
  template: `
  <div style="width:80%; margin: 0 auto">
    <h3>&nbsp; Active Events</h3>
    <event-list time="active"></event-list>
    
    <div style="height:20px;"></div>
    
    <h3>&nbsp; Upcoming Events</h3>
    <event-list time="future"></event-list> 
  </div> 
  `
})

export class HomeComponent  {
}