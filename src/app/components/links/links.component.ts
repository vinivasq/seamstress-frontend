import { Component, OnInit } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { User } from 'src/app/models/identity/User';
import { DrawerService } from 'src/app/services/drawer.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.scss'],
})
export class LinksComponent implements OnInit {
  public drawer!: DrawerService;
  isMobile: boolean;
  user: User;

  constructor(
    private _userService: UserService,
    private _router: Router,
    public drawerService: DrawerService
  ) {
    this.drawer = drawerService;
  }

  ngOnInit() {
    this._userService.currentUser$.subscribe(
      (data: User) => (this.user = data)
    );

    window.screen.width < 992
      ? (this.isMobile = true)
      : (this.isMobile = false);
  }

  logout() {
    this.drawer.close();
    this._userService.logout();
    this._router.navigateByUrl('/user/login');
  }
}
