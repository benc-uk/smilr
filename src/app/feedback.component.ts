import 'rxjs/add/operator/switchMap';
import { Component, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { Directive, ElementRef } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';

import { TopicService } from './topic.service';
import { FeedbackService } from './feedback.service';
import { Topic } from './models/topic';
import { Feedback } from './models/feedback';

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
  topic: Topic;
  feedback: Feedback;
  @ViewChildren(FaceDirective) faces: QueryList<FaceDirective>;
  @ViewChild('subbut') submitButton;
  
  constructor(private topicService: TopicService, private route: ActivatedRoute, private feedbackService: FeedbackService) { 
    this.feedback = new Feedback();
    this.feedback.comments = '';
    this.feedback.rating = 0;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe(
      params => { this.topicService.get(params.get('topic')).subscribe(t => {this.topic = t; this.feedback.topic = t.id })}
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
        d => { document.getElementById("openModalButton").click() }, 
        e => console.log("Error saving feedback!", e));
  }

}

