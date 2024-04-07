import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { BarLineChartComponent } from 'src/app/components/charts/bar-line-chart/bar-line-chart.component';
import { StatisticsComponent } from 'src/app/components/statistics/statistics.component';
import { DoughnutChartComponent } from 'src/app/components/charts/doughnut-chart/doughnut-chart.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [
    CommonModule,
    DoughnutChartComponent,
    BarLineChartComponent,
    StatisticsComponent,
    MatCardModule,
  ],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss'],
})
export class AdminComponent {}
