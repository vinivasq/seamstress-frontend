import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpMethod } from 'src/utils/constants';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})
export class ItemComponent implements OnInit {
  requestMethod: HttpMethod = 'POST';
  itemId?: number;

  constructor(private _activeRoute: ActivatedRoute) {}

  ngOnInit(): void {
    if (this._activeRoute.snapshot.paramMap.has('id')) {
      this.requestMethod = 'PUT';
      this.itemId = +this._activeRoute.snapshot.paramMap.get('id');
    }
  }
}
