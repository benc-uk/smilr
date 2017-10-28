import { Component } from '@angular/core';
import { EventService } from './event.service';
import { Event } from './models/event';

@Component({
  templateUrl: './event-list.component.html',
  selector: "event-list"
})

export class EventListComponent  {
  events: Event[] = [];
  private service: EventService;

  constructor(private es: EventService) { 
    this.service = es;
    this.service.list().subscribe(
      data => {
        this.events = data;
      },
      err => {
        console.log('Unable to load events!');
      }
    );
  }
}