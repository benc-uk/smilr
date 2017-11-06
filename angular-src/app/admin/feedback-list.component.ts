import { Component } from '@angular/core';
import { FeedbackService } from '../feedback.service';
import { EventService } from '../event.service';
import { Feedback } from '../models/feedback';
import { Event } from '../models/event';

@Component({
  templateUrl: './feedback-list.component.html'
})

export class FeedbackListComponent  {
  events: Event[] = [];
  private feedbackService: FeedbackService;
  private eventService: EventService;
  
  constructor(private fs: FeedbackService, private es: EventService) { 
    this.feedbackService = fs;
    this.eventService = es;
    
    this.eventService.listAll().subscribe(
      eventdata => {
        this.events = eventdata;
        this.events.forEach(event => {
          event.topics.forEach(topic => {
            this.feedbackService.listForEventTopic(event.id, ''+topic.id).subscribe(
              // This will load all feedback into the topic, and fully inflate the event object
              feedbackdata => { topic.feedback = feedbackdata; }
            );             
          });        
        });
      },
      err => {
        console.log('Unable to load events!');
      }
    );    
  }
}