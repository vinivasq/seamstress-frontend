import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-buttonAdd',
  templateUrl: './buttonAdd.component.html',
  styleUrls: ['./buttonAdd.component.scss'],
})
export class ButtonAddComponent implements OnInit {
  @Input() route = '';

  constructor() {}

  ngOnInit() {}
}
