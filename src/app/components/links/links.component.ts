import { Component, OnInit } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';
import { DrawerService } from 'src/app/services/drawer.service';

@Component({
  selector: 'app-links',
  templateUrl: './links.component.html',
  styleUrls: ['./links.component.scss'],
})
export class LinksComponent implements OnInit {
  public drawer!: DrawerService;

  constructor(drawerService: DrawerService) {
    this.drawer = drawerService;
  }

  ngOnInit() {}
}
