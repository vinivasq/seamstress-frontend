import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ChartColors } from 'src/helpers/chartColors';
import { ChartPeriodComponent } from '../chart-period/chart-period.component';

@Component({
  selector: 'app-revenue-chart',
  standalone: true,
  imports: [CommonModule, MatCardModule, NgChartsModule, ChartPeriodComponent],
  template: `
    <mat-card class="chart-container elevation">
      <mat-card-header>
        <mat-card-title>Faturamento por período</mat-card-title>
        <app-char-period (valueChange)="filterChart($event)"></app-char-period>
      </mat-card-header>
      <div>
        <canvas
          baseChart
          class="chart barChart"
          [data]="chartData"
          [type]="chartType"
          [options]="chartOptions"
        >
        </canvas>
      </div>
    </mat-card>
  `,
  styleUrls: ['./revenue-chart.component.scss'],
})
export class RevenueChartComponent implements OnInit {
  mockDataSets = [
    {
      data: [140, 45, 200, 290, 180, 120, 300, 30, 25, 220, 95, 55],
      type: 'bar',
      label: 'Em loja',
    },
    {
      data: [120, 70, 310, 10, 250, 90, 40, 80, 200, 175, 65, 70],
      type: 'bar',
      label: 'Midia social',
    },
    {
      data: [360, 20, 85, 135, 270, 50, 180, 30, 250, 70, 95, 200],
      type: 'bar',
      label: 'Ecommerce',
    },
    {
      data: [620, 135, 595, 435, 700, 260, 520, 140, 475, 465, 255, 325],
      type: 'line',
      label: 'Total',
    },
  ];

  ngOnInit(): void {}

  filterChart(value: string) {
    console.log(value);
  }

  public chartOptions: ChartConfiguration['options'] = {
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
  public chartData: ChartData<'bar'> = {
    labels: [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ],
    datasets: this.mockDataSets.map((dataSet: any, index: number) => {
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
  public chartType: ChartType = 'bar';
}
