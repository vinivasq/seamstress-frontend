import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ChartColors } from 'src/helpers/chartColors';
import { ChartPeriodComponent } from '../chart-period/chart-period.component';
import * as data from 'src/app/json/revenue-data.json';

@Component({
  selector: 'app-bar-line-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, NgChartsModule, ChartPeriodComponent],
  template: `
    <mat-card class="chart-container elevation">
      <mat-card-header>
        <mat-card-title>{{ title }}</mat-card-title>
        <app-char-period (valueChange)="filterChart($event)"></app-char-period>
      </mat-card-header>
      <div>
        <canvas
          baseChart
          class="chart barLineChart"
          [data]="chartData"
          [type]="chartType"
          [options]="chartOptions"
        >
        </canvas>
      </div>
    </mat-card>
  `,
  styleUrls: ['./bar-line-chart.component.scss'],
})
export class BarLineChartComponent implements OnInit {
  @Input() source: string;
  @Input() title: string;
  chartData: ChartData<'bar'>;
  chartType: ChartType = 'bar';
  chartOptions: ChartConfiguration['options'] = {
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
      },
    },
    scales: {
      x: {
        ticks: { color: '#f9fafb' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
      y: {
        ticks: { color: '#f9fafb' },
        grid: { color: 'rgba(255,255,255,0.1)' },
      },
    },
    elements: {
      line: {
        tension: 0.5,
      },
    },
  };

  ngOnInit(): void {
    this.getChartData();
  }

  getChartData() {
    const dataResponse = data;

    this.chartData = {
      labels: dataResponse.labels,
      datasets: dataResponse.dataSets.map((dataSet: any, index: number) => {
        const totalDataSet = dataSet.label.toLowerCase() === 'total';
        return {
          data: dataSet.data,
          label: dataSet.label,
          type: dataSet.type,
          backgroundColor: totalDataSet
            ? ChartColors.accent.backgroundColor
            : ChartColors.mono[index].backgroundColor,
          borderColor: totalDataSet
            ? ChartColors.accent.borderColor
            : ChartColors.mono[index].backgroundColor,
          fill: totalDataSet,
        };
      }),
    };
  }

  filterChart(value: string) {
    console.log(value.split('&'));
  }
}
