import { Component } from '@angular/core';
import { environment } from '../../environments/environment';
import { UserService } from './user.service';
import { HttpClient } from "@angular/common/http";
import { Router } from '@angular/router';

@Component({
  template: ''
})

export class AppSvcLogin {
  info: any;

  constructor(userSvc : UserService, private http: HttpClient, private router: Router) { 
    this.http.get('/.auth/me').subscribe(
      data => { userSvc.accessTokens = data; router.navigate(['/home']) },
      err => console.log(err)
    );
  }
}