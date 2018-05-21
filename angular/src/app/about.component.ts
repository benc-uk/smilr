import { Component } from '@angular/core';
import { ConfigService } from './config.service';
import { environment } from '../environments/environment';
import { isDevMode } from '@angular/core';

@Component({
  templateUrl: './about.component.html'
})

export class AboutComponent {
  public apiEndpoint;
  public secured;
  public devMode;

  constructor(config: ConfigService) { 
    this.apiEndpoint = config.values.API_ENDPOINT;
    this.secured = environment.secured ? "Live mode, admin controls require login" : "Demo mode, admin controls are open";
    this.devMode = isDevMode() ? "Angular dev mode" : "Angular prod mode" ;
  }
}