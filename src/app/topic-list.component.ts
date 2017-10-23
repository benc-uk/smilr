import { Component } from '@angular/core';
import { TopicService } from './topic.service';
import { Topic } from './models/topic';

@Component({
  templateUrl: './topic-list.component.html',
  selector: "topic-list"
})

export class TopicListComponent  {
  topics: Topic[] = [];
  private service: TopicService;

  constructor(private ts: TopicService) { 
    this.service = ts;
    this.service.list().subscribe(t => this.topics = t, err => {
      console.log('Unable to load topics!');
    });
  }
}