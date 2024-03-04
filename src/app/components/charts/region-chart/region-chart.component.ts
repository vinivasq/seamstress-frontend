import { CUSTOM_ELEMENTS_SCHEMA, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { ChartColors } from 'src/helpers/chartColors';
import { ChartPeriodComponent } from '../chart-period/chart-period.component';

@Component({
  selector: 'app-region-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule, MatCardModule, ChartPeriodComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <mat-card class="chart-container elevation">
      <mat-card-header>
        <mat-card-title>Pedidos por região</mat-card-title>
        <app-char-period (valueChange)="filterChart($event)"></app-char-period>
      </mat-card-header>
      <mat-card-content>
        <canvas
          baseChart
          class="chart regionChart"
          [data]="chartData"
          [type]="chartType"
          [options]="chartOptions"
        >
        </canvas>
      </mat-card-content>
    </mat-card>
  `,
  styleUrls: ['./region-chart.component.scss'],
})
export class RegionChartComponent implements OnInit {
  filterValue: string;

  constructor() {}

  ngOnInit(): void {}

  filterChart(value: string) {
    console.log(value);
  }

  public chartOptions: ChartConfiguration['options'] = {
    plugins: {
      legend: {
        display: true,
        position: 'left',
      },
    },
  };
  public chartData: ChartData<'doughnut', number[], string | string[]> = {
    labels: ['RS', 'SP', 'RJ'],
    datasets: [
      {
        data: [300, 500, 100],
        backgroundColor: ChartColors.analog.map(
          (color) => color.backgroundColor
        ),
        borderColor: ChartColors.analog.map((color) => color.backgroundColor),
        hoverOffset: 6,
      },
    ],
  };
  public chartType: ChartType = 'doughnut';
}
