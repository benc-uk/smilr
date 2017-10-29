import { Component } from '@angular/core';

import { environment } from '../../environments/environment';
import { EventService } from '../event.service';
import { Event } from '../models/event';
import EventTypes from '../models/eventypes';

@Component({
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})

export class AdminComponent  {
  events: Event[] = [];
  eventService: EventService
  editEvent = null;
  eventTypes = EventTypes;

  constructor(private es: EventService) { 
  this.eventService = es;
    this.eventService.list().subscribe(
      data => {
        this.events = data;
      },
      err => {
        console.log('Unable to load events!');
      }
    );
  }

  newEvent() {
    this.editEvent = new Event();
    this.editEvent.type = "event";

  }

  edit(e) {
    
    this.editEvent = e;
  }

  ok() {
    // Send event to API !!
    this.editEvent = null;
  }  
}