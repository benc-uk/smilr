import { Component } from '@angular/core';
import { FeedbackService } from '../feedback.service';
import { EventService } from '../event.service';
import { Feedback } from '../models/feedback';
import { Event } from '../models/event';

@Component({
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css']
})

export class ReportComponent  {
  events: Event[] = null;
  topicStats: any = {};
  error: any;
  event: Event;

  private feedbackService: FeedbackService;
  private eventService: EventService;
  
  public doReport() {
    this.event.topics.forEach(topic => {
      this.feedbackService.listForEventTopic(this.event.id, ''+topic.id).subscribe(
        // This will load all feedback into the topic, and fully inflate the event object
        // And calc stats on rating
        feedbackdata => { 
          let totalRating: number = 0;
          let feedbackCount: number = 0;       
          feedbackdata.forEach(f => {totalRating += +f.rating; feedbackCount++});
          topic.feedback = feedbackdata; 

          let avg = totalRating / feedbackCount;
          this.topicStats[topic.id] = {avg: avg, count: feedbackCount, avgFloor: Math.round(avg)}                       
        }
      );             
    });     
  }

  constructor(private fs: FeedbackService, private es: EventService) { 
    this.feedbackService = fs;
    this.eventService = es;
    
    // Load all events on load, to populate the dropdown select
    this.eventService.listAll().subscribe(
      eventdata => {
        this.events = eventdata;
      },
      err => {
        console.log('### Unable to load events!');
        this.error = err;
      }
    );    
  }
}