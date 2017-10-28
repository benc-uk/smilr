import 'rxjs/add/operator/switchMap';
import { Component, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { Directive, ElementRef } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { EventService } from './event.service';
import { FeedbackService } from './feedback.service';
import { Event } from './models/event';
import { Feedback } from './models/feedback';
import { Topic } from './models/topic';

@Directive({ selector: '[face]' })
export class FaceDirective {
  selfEle;

  constructor(el: ElementRef) {
    this.selfEle = el;
  }

  deselect() {
    this.selfEle.nativeElement.classList.add('unselected')
  }

  select() {
    this.selfEle.nativeElement.classList.remove('unselected')
  }
}

@Component({
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent  {
  event: Event;
  feedback: Feedback;
  topic: Topic;
  @ViewChildren(FaceDirective) faces: QueryList<FaceDirective>;
  @ViewChild('subbut') submitButton;
  
  constructor(private eventService: EventService, private route: ActivatedRoute, private feedbackService: FeedbackService) { 
    this.feedback = new Feedback();
    this.feedback.comment = '';
    this.feedback.rating = 0;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(
      params => { 
        
        this.eventService.get(params.get('eventid')).subscribe(
          data => {
            this.event = data; 
            var topic_id = parseInt(params.get('topicid'));
            this.topic = this.event.topics.find(item => item.id === topic_id);
            this.feedback.event = params.get('eventid');
            this.feedback.topic = topic_id; 
          }
      )}
    );
  }

  clickFace(face): void {
    this.feedback.rating = face;
    this.faces.forEach(f => {
      f.deselect();
    });
    this.faces.toArray()[face-1].select();
    if(this.feedback.rating > 0) {
      this.submitButton.nativeElement.removeAttribute('disabled');
    }
  }

  submit() {
    this.feedbackService.create(this.feedback)
      .subscribe(
        data => { document.getElementById("openModalButton").click() }, 
        err => console.log("Error saving feedback!", err)
      );
  }

}

