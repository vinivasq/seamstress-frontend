import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-title',
  templateUrl: './title.component.html',
  styleUrls: ['./title.component.scss'],
})
export class TitleComponent implements OnInit {
  @Input() title = '';
  @Input() descripton = '';
  @Input() route = '';
  @Input() btnLabel = '';
  @Input() icon = '';
  @Input() listButton = false;
  @Input() showMenu = false;
  router: Router;

  constructor(private _router: Router) {
    this.router = _router;
  }

  ngOnInit() {
    console.log(this.router.url);
  }
}
