import { Component, isDevMode } from '@angular/core';
import { FeedbackService } from '../feedback.service';
import { Feedback } from '../models/feedback';
import { environment } from '../../environments/environment';

@Component({
  templateUrl: './debug.component.html'
})

export class DebugComponent  {
  info: any;

  constructor() { 
    this.info = { 
      devMode: isDevMode(),
      apiEndpoint: environment.api_endpoint
    }
  }
}