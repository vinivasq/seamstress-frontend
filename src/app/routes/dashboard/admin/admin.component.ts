import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RegionChartComponent } from 'src/app/components/charts/region-chart/region-chart.component';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RegionChartComponent, MatCardModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {}
