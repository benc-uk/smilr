import 'rxjs/add/operator/switchMap';
import { Observable } from "rxjs/Observable";
import { Component, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { Directive, ElementRef } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';

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
    this.selfEle.nativeElement.classList.remove('tossing')
  }

  select() {
    this.selfEle.nativeElement.classList.remove('fadeIn')
    this.selfEle.nativeElement.classList.remove('unselected')
    this.selfEle.nativeElement.classList.add('tossing')
  }
}

@Component({
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent {
  public event: Event;
  public feedback: Feedback;
  public topic: Topic;
  public error: string;
  @ViewChildren(FaceDirective) faces: QueryList<FaceDirective>;
  @ViewChild('subbut') submitButton;
  @ViewChild('confirmDialog') confirmDialog;
  @ViewChild('goAwayDialog') goAwayDialog;
  @ViewChild('badDateDialog') badDateDialog;
  
  constructor(private eventService: EventService, private route: ActivatedRoute, private feedbackService: FeedbackService, private router: Router) { 
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
            let topicId = parseInt(params.get('topicid'));
            this.topic = this.event.topics.find(item => item.id === topicId);
            this.feedback.event = params.get('eventid');
            this.feedback.topic = topicId; 

            // Check dates are valid
            var today = new Date().toISOString().substring(0, 10);    
            if(this.event.start.toString() > today || this.event.end.toString() < today) {
              this.event = null;
              this.badDateDialog.okCallback = () => { this.router.navigate(['/home']) }
              this.badDateDialog.show(); 
              return;
            }

            // Check if already given feedback
            var previous = readCookie(`feedback_${this.event.id}_${this.topic.id}`);
            if(readCookie(`feedback_${this.event.id}_${this.topic.id}`)) {
              this.event = null;
              this.goAwayDialog.okCallback = () => { this.router.navigate(['/home']) }
              this.goAwayDialog.show(); 
              return;
            }            
          },
          err => {
            this.error = "Sorry! There was a problem fetching the event data";
            console.log("### Error getting event!", JSON.stringify(err));            
          }
        )
      }
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
      data => { 
        createCookie(`feedback_${this.event.id}_${this.topic.id}`, this.feedback.rating, 9999);

        this.event = null; 
        this.confirmDialog.okCallback = () => { this.router.navigate(['/home']); }; 
        this.confirmDialog.show(); 
      }, 
      err => {
        this.error = "Sorry! There was a problem submitting your feedback. You can try again.";
        console.log("### Error saving feedback!", JSON.stringify(err));
      }
    );
  }
}

//
// Simple cookie library
// Taken from https://stackoverflow.com/a/24103596/1343261 
//
function createCookie(name,value,days) {
  var expires = "";
  if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + value + expires + "; path=/";
}

function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}

function eraseCookie(name) {
  createCookie(name,"",-1);
}