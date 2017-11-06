import { Component, Attribute, Input } from '@angular/core';
import { EventService } from './event.service';
import { Event } from './models/event';

@Component({
  templateUrl: './event-list.component.html',
  selector: "event-list"
})

export class EventListComponent  {
  @Input() public time; // one of: current, past, future
  events: Event[] = [];

  constructor(private eventService: EventService) { 
  }

  // Can't use constructor as input properties will be defined there, dunno why 
  ngOnChanges() {
    var eventObserver;
    
    if(this.time == "past") eventObserver = this.eventService.listPast();
    else if(this.time == "future") eventObserver = this.eventService.listFuture();
    else eventObserver = this.eventService.listActive();
    
    eventObserver.subscribe(
      data => {
        this.events = data;
      },
      err => {
        console.log('Unable to load events!');
      }
    );
  }

}