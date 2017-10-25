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

  public list(): Observable<Array<Feedback>> {
    console.log(`#### ${this.apiUrl}/feedback`)
    return this.http.get<Array<Feedback>>(`${this.apiUrl}/feedback`);
  }

  /*public get(feedback: string): Observable<Feedback> {
    console.log(`#### ${this.apiUrl}/feedback/${feedback}`)
    return this.http.get<Feedback>(`${this.apiUrl}/feedback/${feedback}`);
  }*/

  public create(feedback: Feedback): Observable<Feedback> {
    console.log(`#### POST ${this.apiUrl}/feedback`)
    return this.http.post<Feedback>(`${this.apiUrl}/feedback`, feedback);
  }  

}