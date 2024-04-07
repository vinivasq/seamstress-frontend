import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { ChartColors } from 'src/helpers/chartColors';
import { ChartPeriodComponent } from '../chart-period/chart-period.component';
import { ChartService } from 'src/app/services/chart.service';
import { ToastrService } from 'ngx-toastr';
import moment from 'moment';
import { HttpResponse } from '@angular/common/http';
import { BarLineChart } from 'src/app/models/viewModels/charts/BarLineChart';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-bar-line-chart',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    NgChartsModule,
    ChartPeriodComponent,
  ],
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
          *ngIf="foundData"
          [data]="chartData"
          [type]="chartType"
          [options]="chartOptions"
        >
        </canvas>
        <span *ngIf="foundData == false" class="notFound">
          <mat-icon>search</mat-icon>
          Nenhum dado encontrado
        </span>
      </div>
    </mat-card>
  `,
  styleUrls: ['./bar-line-chart.component.scss'],
})
export class BarLineChartComponent {
  @Input() source: string;
  @Input() title: string;
  periodBegin: string;
  periodEnd: string;
  foundData: boolean = false;
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

  constructor(
    private _chartService: ChartService,
    private _toastrService: ToastrService
  ) {}

  filterChart(value: string) {
    const [periodBegin, periodEnd] = value.split('&');
    this.getChartData(periodBegin, periodEnd);
  }

  getChartData(periodBegin: string, periodEnd: string) {
    this.periodBegin = moment(new Date(periodBegin)).format('DD/MM/yyyy');
    this.periodEnd = moment(new Date(periodEnd)).format('DD/MM/yyyy');

    this._chartService
      .getBarLineChart(this.source, periodBegin, periodEnd)
      .subscribe({
        next: (data: HttpResponse<BarLineChart>) => {
          if (data.status === 200) {
            const dataResponse = data.body;
            if (dataResponse.dataSets[0].data.length > 0) {
              this.foundData = true;
              this.chartData = {
                labels: dataResponse.labels,
                datasets: dataResponse.dataSets.map(
                  (dataSet: any, index: number) => {
                    const totalDataSet =
                      dataSet.label.toLowerCase() === 'total';
                    return {
                      data: dataSet.data,
                      label: dataSet.label,
                      type: dataSet.type,
                      backgroundColor: totalDataSet
                        ? ChartColors.accent.backgroundColor
                        : ChartColors.analog[index].backgroundColor,
                      borderColor: totalDataSet
                        ? ChartColors.accent.borderColor
                        : ChartColors.analog[index].backgroundColor,
                      fill: totalDataSet,
                      pointBackgroundColor: '#FFF',
                    };
                  }
                ),
              };
            }
          } else if (data.status === 204) {
            this.foundData = false;
            this._toastrService.info(
              'Selecione outro período',
              'Nenhum dado encontrado'
            );
          }
        },
        error: (error: Error) => {
          this._toastrService.error('Erro ao recuperar gráfico');
          console.log(
            `Ocorreu um erro ao recuperar o gráfico de ${this.source}: ${error.message}`
          );
        },
      });
  }
}
