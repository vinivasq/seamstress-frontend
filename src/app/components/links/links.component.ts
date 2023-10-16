import { Component, OnInit } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { Router } from '@angular/router';
import { DrawerService } from 'src/app/services/drawer.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.scss'],
})
export class LinksComponent implements OnInit {
  public drawer!: DrawerService;
  public userService: UserService;

  constructor(
    private _userService: UserService,
    private _router: Router,
    public drawerService: DrawerService
  ) {
    this.drawer = drawerService;
    this.userService = _userService;
  }

  ngOnInit() {}

  logout() {
    this.drawer.close();
    this._userService.logout();
    this._router.navigateByUrl('/user/login');
  }
}
