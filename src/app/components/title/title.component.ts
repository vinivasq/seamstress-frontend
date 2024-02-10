import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss'],
})
export class TitleComponent implements OnInit {
  @Input() title = '';
  @Input() descripton = '';
  @Input() route = '';
  @Input() btnLabel = '';
  @Input() icon = '';
  @Input() listButton = false;
  @Input() showMenu = false;

  constructor() {}

  ngOnInit() {}
}
