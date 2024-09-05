import { Component, Input, OnChanges, OnInit } from '@angular/core';

@Component({
  selector: 'app-cards-widget20',
  templateUrl: './cards-widget20.component.html',
  styleUrls: ['./cards-widget20.component.scss'],
})
export class CardsWidget20Component implements OnChanges {
  @Input() cssClass: string = '';
  @Input() title: string = '';
  @Input() description: string = '';
  @Input() color: string = '';
  @Input() img: string = '';

  @Input() data: any;

  constructor() {}

  ngOnChanges() {
    console.log(this.data);
  }
}
