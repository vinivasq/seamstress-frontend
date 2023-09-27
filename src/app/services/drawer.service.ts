import { Injectable } from '@angular/core';
import { MatDrawer } from '@angular/material/sidenav';

@Injectable({
  providedIn: 'root',
})
export class DrawerService {
  private _drawer!: MatDrawer;

  public setDrawer(drawer: MatDrawer) {
    this._drawer = drawer;
  }

  public open() {
    return this._drawer.open();
  }

  public close() {
    return this._drawer.close();
  }

  public toggle(): void {
    this._drawer.toggle();
  }
}
