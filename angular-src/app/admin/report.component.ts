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
  events: Event[] = [];
  eventStats: any = {};

  private feedbackService: FeedbackService;
  private eventService: EventService;
  
  constructor(private fs: FeedbackService, private es: EventService) { 
    this.feedbackService = fs;
    this.eventService = es;
    
    this.eventService.listAll().subscribe(
      eventdata => {
        this.events = eventdata;

        this.events.forEach(event => {
          let totalRating: number = 0;
          let feedbackCount: number = 0;          
          event.topics.forEach(topic => {
            this.feedbackService.listForEventTopic(event.id, ''+topic.id).subscribe(
              // This will load all feedback into the topic, and fully inflate the event object
              // And calc stats on rating
              feedbackdata => { 
                feedbackdata.forEach(f => {totalRating += +f.rating; feedbackCount++});
                topic.feedback = feedbackdata; 

                let avg = totalRating / feedbackCount;
                this.eventStats[`_${event.id}`] = {avg: avg, count: feedbackCount, avgFloor: Math.round(avg)}                       
              }
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