import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { environment } from '../../environments/environment';
import { EventService } from '../event.service';
import { Event } from '../models/event';
import { Topic } from '../models/topic';
import EventTypes from '../models/event';

@Component({
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})

export class AdminComponent  {
  events: Event[] = null;
  editEvent : Event = null;
  eventTypes = EventTypes;
  topicError = false;
  dateError = false;
  @ViewChild('deleteDialog') deleteDialog;
  error: any;

  constructor(private eventService: EventService, private router: Router) { 
    this.eventService.listAll().subscribe(
      data => { this.events = data; },
      err => { this.error = err; console.log('Unable to load events!'); }
    );
  }

  newEvent() {
    this.topicError = false;

    this.editEvent = new Event();
    this.editEvent.type = "event";
  
    var topic = new Topic();
    topic.desc = "General";
    topic.id = 1;
    
    this.editEvent.topics = new Array<Topic>();
    this.editEvent.topics.push(topic)
  }

  edit(event) {
    this.topicError = false;
    this.editEvent = event;
  }

  saveEvent(event: Event) {
    this.topicError = false;
    this.dateError = false;

    // Check for blank topics, couldn't find a way to validate multiple objects in the template
    event.topics.forEach(t => { if(t.desc.length <= 0) this.topicError = true; })
    if(this.topicError) return;

    // Check dates are valid, e.g start after end
    this.dateError = (event.end < event.start);  // Bloody hell, string compare works on ISO 8601 dates!
    if(this.dateError) return;

    // Send event to API, either add or update, if id present means update
    if(!event.id) {
      this.eventService.add(event).subscribe(
        data => { console.log(data); this.events.push(data) },
        err => { console.log("Error creating event", err) }
      );
    } else {
      this.eventService.update(event).subscribe(
        data => { },
        err => { console.log("Error updating event", err) }
      )
    }
    
    this.editEvent = null;
  }  

  newTopic(event: Event) {
    var maxid = -1;
    event.topics.map(t => { if(t.id > maxid) maxid = t.id })

    var newTopic = new Topic();
    newTopic.id = maxid + 1;
    newTopic.desc = "";
    event.topics.push(newTopic);
  }

  deleteTopic(event: Event, topic: Topic) {
    if(event.topics.length <= 1) return;

    event.topics.forEach((t, i) => { if(t.id === topic.id) event.topics.splice(i, 1) });
  }  

  deleteEvent(event: Event) {
    this.deleteDialog.okCallback = () => {
      this.eventService.delete(event).subscribe(
        data => { this.events.forEach((e, i) => { if(e.id === event.id) this.events.splice(i, 1) }); },
        err => console.log("Error deleting event", err)
     );
    }
    this.deleteDialog.dialogBody = `Do you want to delete '${event.title}'? <br/><br/> This operation can not be undone!`;
    this.deleteDialog.show();
  } 

  cancel() {
    this.editEvent = null;
  }
}