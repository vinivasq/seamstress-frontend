import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatDrawer } from '@angular/material/sidenav';
import { DrawerService } from './services/drawer.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('drawer') public drawer!: MatDrawer;
  screenWidth = 0;

  constructor(private router: Router, public drawerService: DrawerService) {}

  ngAfterViewInit(): void {
    this.screenWidth = window.screen.width;
    this.drawerService.setDrawer(this.drawer);
  }

  showMenu(): boolean {
    return this.router.url == '/user/login' ||
      this.router.url == '/user/register'
      ? false
      : true;
  }
}
