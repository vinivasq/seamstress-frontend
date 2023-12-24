import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from 'src/app/models/identity/User';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-tableHeader',
  templateUrl: './tableHeader.component.html',
  styleUrls: ['./tableHeader.component.scss'],
})
export class TableHeaderComponent implements OnInit {
  @Output() keyPressed = new EventEmitter<string>();
  @Input() placeholder = '';
  @Input() route = '';
  @Input() label = '';
  filterValue: string = '';
  user: User;

  constructor(private _userService: UserService) {}

  ngOnInit(): void {
    this._userService.currentUser$.subscribe(
      (data: User) => (this.user = data)
    );
  }

  setFilterValue() {
    this.keyPressed.emit(this.filterValue);
  }
}
