import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  Input,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { ChartColors } from 'src/helpers/chartColors';
import { ChartPeriodComponent } from '../chart-period/chart-period.component';
import * as data from 'src/app/json/region-data.json';

@Component({
  selector: 'app-doughnut-chart',
  standalone: true,
  imports: [CommonModule, NgChartsModule, MatCardModule, ChartPeriodComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <mat-card class="chart-container elevation">
      <mat-card-header>
        <mat-card-title>{{ title }}</mat-card-title>
        <app-char-period (valueChange)="filterChart($event)"></app-char-period>
      </mat-card-header>
      <mat-card-content>
        <canvas
          baseChart
          class="chart doughnutChart"
          [data]="chartData"
          [type]="chartType"
          [options]="chartOptions"
        >
        </canvas>
      </mat-card-content>
    </mat-card>
  `,
  styleUrls: ['./doughnut-chart.component.scss'],
})
export class DoughnutChartComponent implements OnInit {
  @Input() source: string;
  @Input() title: string;
  chartData: ChartData<'doughnut', number[], string | string[]>;
  chartType: ChartType = 'doughnut';
  chartOptions: ChartConfiguration['options'] = {
    plugins: {
      legend: {
        display: true,
        position: 'left',
      },
    },
  };

  ngOnInit(): void {
    this.getChartData();
  }

  filterChart(value: string) {
    console.log(value);
  }

  getChartData() {
    const dataResponse = data;

    this.chartData = {
      labels: dataResponse.labels,
      datasets: [
        {
          data: dataResponse.dataSets,
          backgroundColor: ChartColors.analog.map(
            (color) => color.backgroundColor
          ),
          borderColor: ChartColors.analog.map((color) => color.backgroundColor),
          hoverOffset: 6,
        },
      ],
    };
  }
}
