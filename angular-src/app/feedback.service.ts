import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";

import { Feedback } from './models/feedback';
import { environment } from '../environments/environment';

@Injectable()
export class FeedbackService {

  // URL to web api - can be remote or local in memory 
  private apiUrl = environment.api_endpoint;
  private headers = new Headers({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  //
  // List feedback for an event & topic. GET /api/feedback/{eventid}/{topicid}
  //
  public listForEventTopic(eventid: string, topicid: string): Observable<Array<Feedback>> {    
    // Kludgy workaround for in-mem API 
    if(environment.production)
      return this.http.get<Array<Feedback>>(`${this.apiUrl}/feedback/${eventid}/${topicid}`);
    else
      return this.http.get<Array<Feedback>>(`${this.apiUrl}/feedback?event=${eventid}&topic=${topicid}`);  
  }

  //
  // Create new feedback. POST /api/feedback
  //
  public create(feedback: Feedback): Observable<Feedback> {
    return this.http.post<Feedback>(`${this.apiUrl}/feedback`, feedback);
  }  

}