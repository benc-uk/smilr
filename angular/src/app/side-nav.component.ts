import { Component, Input } from '@angular/core';
import { UserService } from './admin/user.service';
import { ModalDialogComponent } from './modal-dialog.component';

@Component({
  selector: 'side-nav',
  template: `
  <div id="mobileNav" [ngClass]="{'open': isOpen}">
    <a href="javascript:void(0)" class="closebtn" (click)="close()">&times;</a>
    <a [routerLink]="['/events']" (click)="close()"><i class="fa fa-book"></i> Events</a>
    <a *ngIf="!env.secured || userService.isLoggedIn()" [routerLink]="['/admin/report']" (click)="close()"><i class="fa fa-bar-chart"></i> Reports</a>
    <a *ngIf="!env.secured || userService.isLoggedIn()" [routerLink]="['/admin/events']" (click)="close()"><i class="fa fa-wrench"></i> Admin</a>
    <a *ngIf="!env.secured || userService.isLoggedIn()" href='/.auth/logout/aad' (click)="close()"><i class="fa fa-user-circle"></i> Logout</a>
    <a *ngIf="env.secured && !userService.isLoggedIn()" href='/.auth/login/aad?post_login_redirect_uri=/logincomplete'><i class="fa fa-user"></i> Login</a>
    <a (click)="close(); aboutDialog.show()"><i class="fa fa-info-circle"></i> About</a>
  </div>  
  `,
  styleUrls: ['./side-nav.component.css']
})
export class SideNavComponent {

  @Input() public env: any;
  @Input() userService: UserService;
  @Input() aboutDialog: ModalDialogComponent;
  public isOpen: boolean = false;

  open() {
    this.isOpen = true;
  }

  close() {
    this.isOpen = false;
  }

  toggle() {
    this.isOpen = !this.isOpen;
  }
}
