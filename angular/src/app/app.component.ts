import { Component, ViewChild } from '@angular/core';
import { environment } from '../environments/environment';
import { UserService } from './admin/user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'app'; 
  
  public env = environment;
  public userService: UserService;
  @ViewChild('sideNav') public sideNav;

  constructor(us: UserService) {
    this.userService = us;
  }
}
