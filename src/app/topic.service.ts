import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";

import { Topic } from './models/topic';
import { environment } from '../environments/environment';

@Injectable()
export class TopicService {

  // URL to web api - can be remote or local in memory 
  private apiUrl = environment.api_endpoint;
  private headers = new Headers({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  public list(): Observable<Array<Topic>> {
    console.log(`#### ${this.apiUrl}/topics`)
    return this.http.get<Array<Topic>>(`${this.apiUrl}/topics`);
  }

  public get(topic: string): Observable<Topic> {
    console.log(`#### ${this.apiUrl}/topics/${topic}`)
    return this.http.get<Topic>(`${this.apiUrl}/topics/${topic}`);
  }

}