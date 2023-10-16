import { Component } from '@angular/core';
import { DrawerService } from 'src/app/services/drawer.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
})
export class ToolbarComponent {
  public drawer: DrawerService;

  constructor(public drawerService: DrawerService) {
    this.drawer = drawerService;
  }
}
