
import { Component, Attribute, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
    selector: 'modal-dialog',
    template: `
    <div class="modal fade" tabindex="-1" [ngClass]="{'in': visibleAnimate}"
         [ngStyle]="{'display': visible ? 'block' : 'none', 'opacity': visibleAnimate ? 1 : 0}">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h4 class="modal-title alert alert-info"> {{ dialogTitle }} </h4>
          </div>
          <div class="modal-body" [innerHTML]="dialogBody">
            
          </div>
          <div class="modal-footer">
          <button class="btn btn-primary" *ngIf="okCallback" (click)="okCallback(); hide()">{{okButtonText}}</button>
          <button class="btn btn-primary" *ngIf="!okCallback" (click)="hide()">{{okButtonText}}</button>
          <button class="btn btn-default" *ngIf="!hideCancel" (click)="hide()">CANCEL</button>
          </div>
        </div>
      </div>
    </div>
    `
  })

  export class ModalDialogComponent {
  
    public visible = false;
    public visibleAnimate = false;
    
    //@Input() data: any;
    @Input() public dialogTitle: string;
    @Input() public dialogBody: string;
    @Input() public okCallback;
    @Input() public cancelCallback;
    @Input() public hideCancel;
    @Input() public okButtonText = "  OK  ";
    
    constructor(private router: Router) {
    }

    public show(): void {
      //this.data = inputData;
      this.visible = true;
      setTimeout(() => this.visibleAnimate = true, 100);
    }
  
    public hide(): void {
      this.visibleAnimate = false;
      setTimeout(() => this.visible = false, 300);
    }
  
    public onContainerClicked(event: MouseEvent): void {
      if ((<HTMLElement>event.target).classList.contains('modal')) {
        this.hide();
      }
    }
  }