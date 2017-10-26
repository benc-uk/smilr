import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

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
