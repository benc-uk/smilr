import { Component, } from '@angular/core';
import { EventService } from './event.service';
import { Event } from './models/event';

@Component({
  template: `
  <div class="row padded-left">
    <div class="form-group col-sm-4">
      <label for="eventTime">Select a timeframe to locate events:</label>
      <select [(ngModel)]="time" name="eventTime" id="eventTime" class="form-control" >
        <option value="active"> Active</option>
        <option value="future"> Future</option>
        <option value="past"> Past</option>
      </select>
    </div>
  </div>

  <div class="row">
    <div class="col-md-10 col-md-offset-1">
      <h3>&nbsp; {{time | titlecase }} Events </h3>
      <event-list time="{{time}}"></event-list>  
    </div>
  </div> 
  `
})

export class EventHistoryComponent  {
  
  events: Event[] = null;
  time: string = "active";

  constructor(private eventService: EventService) { 
  }

}