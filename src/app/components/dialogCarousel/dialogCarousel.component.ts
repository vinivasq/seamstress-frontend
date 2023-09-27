import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DialogCarouselData } from './dialogCarouselData';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-dialogCarousel',
  templateUrl: './dialogCarousel.component.html',
  styleUrls: ['./dialogCarousel.component.scss'],
})
export class DialogCarouselComponent {
  imageAPI = environment.imageAPI;

  constructor(@Inject(MAT_DIALOG_DATA) public data: DialogCarouselData) {}
}
