import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { ConfigService } from './config.service';
import { Observable } from "rxjs";

import { Feedback } from './models/feedback';
import { environment } from '../environments/environment';

@Injectable()
export class FeedbackService {

  // URL to web api - can be remote or local in-memory 
  private apiEndpoint;
  
  constructor(private http: HttpClient, config: ConfigService) {
    this.apiEndpoint = config.values.API_ENDPOINT;
    if(!this.apiEndpoint) 
      console.error(`### ERROR! API endpoint is not set! Configure the API_ENDPOINT in the config section of environment.ts or set on the server as environmental variable`)
  }
  //
  // List feedback for an event & topic. GET /api/feedback/{eventid}/{topicid}
  //
  public listForEventTopic(eventid: string, topicid: string): Observable<Array<Feedback>> {    
    // Kludgy workaround for in-mem API 
    if(environment.production)
      return this.http.get<Array<Feedback>>(`${this.apiEndpoint}/feedback/${eventid}/${topicid}`);
    else
      return this.http.get<Array<Feedback>>(`${this.apiEndpoint}/feedback?event=${eventid}&topic=${topicid}`);  
  }

  //
  // Create new feedback. POST /api/feedback
  //
  public create(feedback: Feedback): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.apiEndpoint}/feedback`, feedback);
  }  

}