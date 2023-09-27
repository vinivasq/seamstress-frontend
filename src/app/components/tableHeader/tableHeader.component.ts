import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-tableHeader',
  templateUrl: './tableHeader.component.html',
  styleUrls: ['./tableHeader.component.scss'],
})
export class TableHeaderComponent {
  @Output() keyPressed = new EventEmitter<string>();
  @Input() placeholder = '';
  @Input() route = '';
  @Input() label = '';
  filterValue: string = '';

  constructor() {}

  setFilterValue() {
    this.keyPressed.emit(this.filterValue);
  }
}
