import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs/Observable";

import { environment } from '../environments/environment';
import { XHRConnection } from '@angular/http/src/backends/xhr_backend';

@Injectable()
export class ConfigService {
  private _config: any;

  constructor(private http: HttpClient) { }

  loadConfig(): Promise<any> {
    let varNames = environment.configServerVars.join(',');

    // When in prod-mode, fetch from server as environmental vars
    // We have a fixed dependency on the server to present the /.config route as an API to us
    // See `service-frontend\server.js` for details on this API
    if(environment.production) {
      return this.http.get(`/.config/${varNames}`)
      .map(data => {this._config = data})
      .toPromise();

    } else {
      // When in dev-mode, fetch from local hardcoded environment.config object
      return new Promise((resolve, reject) => {
        this._config = environment.config;
        resolve(this._config);
      });     
    }
  }

  get values(): any {
    return this._config;
  }
}