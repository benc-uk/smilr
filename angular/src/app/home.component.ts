import { Component } from '@angular/core';

@Component({
  template: `
  <div class="row">
    <div class="col-md-10 col-md-offset-1">
      <h3>&nbsp; Active Events</h3>
      <event-list time="active">
      </event-list>
    </div>

    <hr/>
    
    <div class="col-md-10 col-md-offset-1">
      <h3>&nbsp; Upcoming Events</h3>
      <event-list time="future">
      </event-list> 
    </div>
  </div> 
  `
})

export class HomeComponent  {
}