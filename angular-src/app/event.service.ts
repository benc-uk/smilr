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

  public add(event: Event): Observable<Event> {
    if(!environment.production) {
      event.id = makeid(6);
    }
    var url = `${this.apiUrl}/events`
    return this.http.post<Event>(url, event);
  }

  public update(event: Event): Observable<Event> {
    var url = `${this.apiUrl}/events/${event.id}`
    return this.http.put<Event>(url, event);
  }

  public delete(event: Event): Observable<Event> {
    var url = `${this.apiUrl}/events/${event.id}`
    return this.http.delete<any>(url);
  }
}

//
// Simple random ID generator, good enough, with len=6 it's a 1:56 in billion chance of a clash
//
function makeid(len) {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}