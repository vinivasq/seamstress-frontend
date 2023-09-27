import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-attributesNavigation',
  templateUrl: './attributesNavigation.component.html',
  styleUrls: ['./attributesNavigation.component.scss'],
})
export class AttributesNavigationComponent implements OnInit {
  @Input() modelButton = true;
  @Input() setButton = true;
  @Input() colorButton = true;
  @Input() fabricButton = true;
  @Input() sizeButton = true;

  constructor() {}

  ngOnInit() {}
}
