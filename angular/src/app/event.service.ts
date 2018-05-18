import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { ConfigService } from './config.service';
import { Observable } from "rxjs";
import { filter, map } from 'rxjs/operators';
import * as jsotp from 'jsotp';

import { Event } from './models/event';
import { environment } from '../environments/environment';

@Injectable()
export class EventService {

  // URL to web api - can be remote or local in-memory 
  private apiEndpoint;

  constructor(private http: HttpClient, config: ConfigService) {
    this.apiEndpoint = config.values.API_ENDPOINT;
    if(!this.apiEndpoint) 
      console.error(`### ERROR! API endpoint is not set! Configure the API_ENDPOINT in the config section of environment.ts or set on the server as environmental variable`)
    else
      console.log(`### EventService configured with API_ENDPOINT=${this.apiEndpoint}`)
  }

  //
  // Get all events. GET /api/events
  //
  public listAll(): Observable<Array<Event>> {
    return this.http.get<Array<Event>>(`${this.apiEndpoint}/events`);
  }

  //
  // Get events which are active/running. GET /api/events?type=active
  //
  public listActive(): Observable<Array<Event>> {
    var today = new Date().toISOString().substring(0, 10);

    if(environment.production) {
      // Call real external REST API, return observable
      return this.http.get<Array<Event>>(`${this.apiEndpoint}/events/filter/active`);
    } else {
      // In mem API, return *all* events then filter 
      return this.http.get<Array<Event>>(`${this.apiEndpoint}/events`)
      .map(events => events.filter(event => {
        if(event.start.toString() <= today && event.end.toString() >= today) return true;
      }));
    }
  }

  //
  // Get events which are in the past. GET /api/events?type=past
  //
  public listPast(): Observable<Array<Event>> {
    var today = new Date().toISOString().substring(0, 10);

    if(environment.production) {
      // Call real external REST API, return observable
      return this.http.get<Array<Event>>(`${this.apiEndpoint}/events/filter/past`);
    } else {
      // In mem API workaround, return *all* events then filter 
      return this.http.get<Array<Event>>(`${this.apiEndpoint}/events`)
      .map(events => events.filter(event => {
        if(event.end.toString() < today) return true;
      }));
    }
  }

  //
  // Get events which are in the future. GET /api/events?type=future
  //
  public listFuture(): Observable<Array<Event>> {
    var today = new Date().toISOString().substring(0, 10);

    if(environment.production) {
      // Call real external REST API, return observable
      return this.http.get<Array<Event>>(`${this.apiEndpoint}/events/filter/future`);
    } else {
      // In mem API workaround, return *all* events then filter 
      return this.http.get<Array<Event>>(`${this.apiEndpoint}/events`)
      .map(events => events.filter(event => {
        if(event.start.toString() > today) return true;
      }));
    }
  }

  //
  // Get single event. GET /api/events/{id}
  //
  public get(id: string): Observable<Event> {
    let url = `${this.apiEndpoint}/events/${id}`
    return this.http.get<Event>(url);
  }

  //
  // Create a new event. POST /api/events
  //
  public add(event: Event): Observable<Event> {
    if(!environment.production) {
      event.id = EventService.makeId(6);
    }
    let url = `${this.apiEndpoint}/events`;

    // Use time based one-time passcodes with this API call
    let totp = jsotp.TOTP(environment.dataApiKey);
    let options = { headers: new HttpHeaders().set('X-SECRET', totp.now()) }

    return this.http.post<Event>(url, event, options);
  }

  //
  // Update an existing event. PUT /api/events/{id}
  //
  public update(event: Event): Observable<Event> {
    let url = `${this.apiEndpoint}/events`;

    // Use time based one-time passcodes with this API call
    let totp = jsotp.TOTP(environment.dataApiKey);
    let options = { headers: new HttpHeaders().set('X-SECRET', totp.now()) }

    return this.http.put<Event>(url, event, options);
  }

  //
  // Delete an event. DELETE /api/events/{id}
  //
  public delete(event: Event): Observable<Event> {
    let url = `${this.apiEndpoint}/events/${event.id}`;

    // Use time based one-time passcodes with this API call
    let totp = jsotp.TOTP(environment.dataApiKey);
    let options = { headers: new HttpHeaders().set('X-SECRET', totp.now()) }

    return this.http.delete<any>(url, options);
  }

  //
  // Simple random ID generator, good enough, with len=6 it's a 1:56 in billion chance of a clash
  //
  public static makeId(len: number) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  
    for (var i = 0; i < len; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;    
  }
}