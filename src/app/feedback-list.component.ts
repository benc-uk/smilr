import { Component } from '@angular/core';
import { FeedbackService } from './feedback.service';
import { Feedback } from './models/feedback';

@Component({
  templateUrl: './feedback-list.component.html',
  styleUrls: ['./home.component.css']
})

export class FeedbackListComponent  {
  feedbackList: Feedback[] = [];
  private service: FeedbackService;

  constructor(private ts: FeedbackService) { 
    this.service = ts;
    this.service.list().subscribe(t => this.feedbackList = t, err => {
      console.log('Unable to load feedback!', err);
    });
  }
}