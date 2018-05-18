import { Component, Attribute, Input } from '@angular/core';
import { EventService } from './event.service';
import { Event } from './models/event';
import 'rxjs/add/operator/map';

@Component({
  templateUrl: './event-list.component.html',
  selector: "event-list"
})

export class EventListComponent  {
  @Input() public time; // one of: current, past, future
  events: Event[] = null;
  error: any;

  constructor(private eventService: EventService) { 
  }

  // Can't use constructor as input properties will be defined there, dunno why 
  ngOnChanges() {
    this.events = null;
    var eventObserver;
    
    if(this.time == "past") eventObserver = this.eventService.listPast();
    else if(this.time == "future") eventObserver = this.eventService.listFuture();
    else eventObserver = this.eventService.listActive();
    
    eventObserver.subscribe(
      data => {
        this.events = data;
      },
      err => {
        console.log('### Unable to load events!');
        this.error = err;
      }
    );
  }

  dayCount(start: string, end: string): number {
    let d1:any = new Date(start);
    let d2:any = new Date(end);
    let days = Math.round((d2-d1)/(1000*60*60*24));
    return days + 1;
  }

}