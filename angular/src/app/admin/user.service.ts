import { Injectable } from '@angular/core';
import { CanActivate } from "@angular/router";
import { Router }  from '@angular/router';

import { environment } from '../../environments/environment';

@Injectable()
export class UserService implements CanActivate {
  
  loggedIn : boolean = true;
  public accessTokens = null;

  constructor(private router: Router) { }

  canActivate() {
    if(environment.secured) {
      if(this.isLoggedIn()) {
        return true;
      } else {
        alert("Not logged in!");
        this.router.navigate(['/home']);
        return false;
      }
    } else {
      return true;
    }
  }

  isLoggedIn() {
    return (this.accessTokens != null && this.accessTokens[0].user_id);
  }

  getUserId() {
    return this.accessTokens[0].user_id;
  }
}