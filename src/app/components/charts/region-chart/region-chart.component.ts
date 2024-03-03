import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { ChartColors } from 'src/helpers/chartColors';

@Component({
  selector: 'app-region-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule, MatCardModule],
  template: `
    <mat-card class="chart-container elevation">
      <mat-card-title>Pedidos por região</mat-card-title>
      <mat-card-content>
        <canvas
          baseChart
          class="chart"
          [data]="pieChartData"
          [type]="pieChartType"
          [options]="pieChartOptions"
        >
        </canvas>
      </mat-card-content>
    </mat-card>
  `,
  styleUrls: ['./region-chart.component.scss'],
})
export class RegionChartComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  public pieChartOptions: ChartConfiguration['options'] = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
  };
  public pieChartData: ChartData<'pie', number[], string | string[]> = {
    labels: [['Download', 'Sales'], ['In Store Sales'], 'Mail Sales'],
    datasets: [
      {
        data: [300, 500, 100],
        backgroundColor: ChartColors.analog.map(
          (color) => color.backgroundColor
        ),
        borderColor: ChartColors.analog.map((color) => color.backgroundColor),
        hoverOffset: 4,
      },
    ],
  };
  public pieChartType: ChartType = 'pie';
}
