import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-buttonAdd',
  templateUrl: './buttonAdd.component.html',
  styleUrls: ['./buttonAdd.component.scss'],
})
export class ButtonAddComponent implements OnInit {
  @Input() route = '';
  @Output() buttonClick = new EventEmitter<void>();

  constructor() {}

  ngOnInit() {}
}
