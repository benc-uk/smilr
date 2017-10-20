import { Component, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { Directive, ElementRef } from '@angular/core';

@Directive({ selector: '[face]' })
export class FaceDirective {
  selfEle;

  constructor(el: ElementRef) {
    this.selfEle = el;
  }

  deselect() {
    this.selfEle.nativeElement.classList.add('unselected')
  }
  select() {
    this.selfEle.nativeElement.classList.remove('unselected')
  }
  /*@HostListener('click', ['$event']) onClick($event){
    this.selfEle.nativeElement.classList.remove('unselected')
  }*/
}

@Component({
  templateUrl: './feedback.component.html',
  styleUrls: ['./feedback.component.css']
})
export class FeedbackComponent  {
  selected: number;
  @ViewChildren(FaceDirective) faces: QueryList<FaceDirective>;
  @ViewChild('subbut') submitButton;
  @ViewChild('dialog') dialog;
  
  constructor() { 
    this.selected = 0;
  }

  clickFace(face, event: any): void {

    this.selected = face;
    this.faces.forEach(f => {
      f.deselect();
    });
    this.faces.toArray()[face-1].select();
    if(this.selected != 0) {
      this.submitButton.nativeElement.removeAttribute('disabled');
    }
  }

  submit() {

  }

}

