import { Component, } from '@angular/core';
import { EventService } from './event.service';
import { Event } from './models/event';

@Component({
  template: `
  <div style="padding-left:20px">
    <label for="eventType">Select a timeframe to locate events:</label>
    <select style="width:20%" [(ngModel)]="time" name="eventTime" id="eventTime" class="form-control" >
      <option value="active"> Active</option>
      <option value="future"> Future</option>
      <option value="past"> Past</option>
    </select>
  </div>

  <h3>&nbsp; {{time | titlecase }} Events </h3>
  <event-list time="{{time}}"></event-list>  
  `
})

export class EventHistoryComponent  {
  
  events: Event[] = null;
  time: string = "active";

  constructor(private eventService: EventService) { 
  }

}