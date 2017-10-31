import { Component, Input } from '@angular/core';
import { EventService } from './event.service';
import { Event } from './models/event';

@Component({
  templateUrl: './event-list.component.html',
  selector: "event-list"
})

export class EventListComponent  {
  @Input() time: string; // one of: current, past, future
  events: Event[] = [];

  constructor(private eventService: EventService) { 
    this.eventService.list().subscribe(
      data => {
        this.events = data;
      },
      err => {
        console.log('Unable to load events!');
      }
    );
  }
}