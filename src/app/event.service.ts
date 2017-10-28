import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";

import { Event } from './models/event';
import { environment } from '../environments/environment';

@Injectable()
export class EventService {

  // URL to web api - can be remote or local in memory 
  private apiUrl = environment.api_endpoint;
  private headers = new Headers({ 'Content-Type': 'application/json' });

  constructor(private http: HttpClient) { }

  public list(): Observable<Array<Event>> {
    return this.http.get<Array<Event>>(`${this.apiUrl}/events`);
  }

  public get(id: string): Observable<Event> {
    var url = `${this.apiUrl}/events/${id}`
    return this.http.get<Event>(url);
  }

}