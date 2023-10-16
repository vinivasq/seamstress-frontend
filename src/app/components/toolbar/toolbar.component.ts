import { Component } from '@angular/core';
import { Observable, take } from 'rxjs';
import { User } from 'src/app/models/identity/User';
import { DrawerService } from 'src/app/services/drawer.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  public drawer: DrawerService;

  constructor(
    // public userService: UserService,
    public drawerService: DrawerService
  ) {
    this.drawer = drawerService;
  }

  // getUser() {
  //   console.log('getuser');

  //   return this.userService.currentUser$.pipe(take(1));
  // }
}
