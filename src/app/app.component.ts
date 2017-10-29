import { Component } from '@angular/core';
import { environment } from '../environments/environment';
import { UserService } from './admin/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  env = environment;
  userService;

  constructor(us: UserService) {
    this.userService = us;
  }
  
  openNav() {
    document.getElementById("mobileNav").style.width = "50%";
  }

  closeNav() {
    document.getElementById("mobileNav").style.width = "0";
  }

  toggleNav() {
    var wid = document.getElementById("mobileNav").style.width;
    if(wid.length == 0 || wid == "0" || wid == "0px")
      document.getElementById("mobileNav").style.width = "50%";
    else
      document.getElementById("mobileNav").style.width = "0";
  }  
}
