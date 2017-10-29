import { Component } from '@angular/core';
import { Router } from '@angular/router';
import 'rxjs/add/operator/map';

import { EventService } from './event.service';
import { Event } from './models/event';

@Component({
  templateUrl: './home.component.html'
})
export class HomeComponent  {
}