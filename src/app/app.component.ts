import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { DrawerService } from './services/drawer.service';
import { User } from './models/identity/User';
import { UserService } from './services/user.service';
import { ThemeService } from 'ng2-charts';
import { ChartOptions } from 'chart.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit, OnInit {
  @ViewChild('drawer') public drawer!: MatDrawer;
  screenWidth = 0;
  userService: UserService;

  constructor(
    private _userService: UserService,
    private themeService: ThemeService,
    public drawerService: DrawerService
  ) {
    this.userService = _userService;
  }

  ngAfterViewInit(): void {
    this.screenWidth = window.screen.width;
    this.drawerService.setDrawer(this.drawer);
  }

  ngOnInit(): void {
    this.setCurrentUser();
    this.setChartTheme();
  }

  setChartTheme() {
    let overrides: ChartOptions;
    overrides = {
      plugins: {
        legend: {
          labels: { color: '#f9fafb' },
        },
      },
    };
    this.themeService.setColorschemesOptions(overrides);
  }

  setCurrentUser() {
    let user: User;

    if (localStorage.getItem('user')) {
      user = JSON.parse(localStorage.getItem('user') ?? '{}');
    } else {
      user = null;
    }

    if (user) this._userService.setCurrentUser(user);
  }
}
