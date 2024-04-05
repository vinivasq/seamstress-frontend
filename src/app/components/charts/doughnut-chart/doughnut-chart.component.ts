import { CUSTOM_ELEMENTS_SCHEMA, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import { MatCardModule } from '@angular/material/card';
import { ChartColors } from 'src/helpers/chartColors';
import { ChartPeriodComponent } from '../chart-period/chart-period.component';
import { ChartService } from 'src/app/services/chart.service';
import { DoughnutChart } from 'src/app/models/viewModels/charts/DoughnutChart';
import { ToastrService } from 'ngx-toastr';
import { HttpResponse } from '@angular/common/http';
import { MatIconModule } from '@angular/material/icon';
import moment from 'moment';

@Component({
  selector: 'app-doughnut-chart',
  standalone: true,
  imports: [
    CommonModule,
    NgChartsModule,
    MatCardModule,
    ChartPeriodComponent,
    MatIconModule,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  template: `
    <mat-card class="chart-container elevation">
      <div class="header">
        <div class="header__info">
          <mat-card-title>{{ title }}</mat-card-title>
          <p>{{ subtitle }}</p>
        </div>
        <app-char-period (valueChange)="filterChart($event)"></app-char-period>
      </div>
      <mat-card-content>
        <canvas
          baseChart
          *ngIf="foundData"
          class="doughnutChart"
          [data]="chartData"
          [type]="chartType"
          [options]="chartOptions"
        >
        </canvas>
        <span class="period" *ngIf="foundData"
          >{{ periodBegin }} - {{ periodEnd }}</span
        >
        <span *ngIf="foundData == false" class="notFound">
          <mat-icon>search</mat-icon>
          Nenhum dado encontrado
        </span>
      </mat-card-content>
    </mat-card>
  `,
  styleUrls: ['./doughnut-chart.component.scss'],
})
export class DoughnutChartComponent {
  @Input() source: string;
  @Input() title: string;
  @Input() subtitle?: string;
  periodBegin: string;
  periodEnd: string;
  foundData: boolean = false;
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

  constructor(
    private _chartService: ChartService,
    private _toastrService: ToastrService
  ) {}

  filterChart(value: string) {
    const [periodBegin, periodEnd] = value.split('&');

    // const periodBegin = '2024-03-01T03:00:00.000Z';
    // const periodEnd = '2024-03-30T03:00:00.000Z';

    this.getChartData(periodBegin, periodEnd);
  }

  getChartData(periodBegin: string, periodEnd: string) {
    this.periodBegin = moment(new Date(periodBegin)).format('DD/MM/yyyy');
    this.periodEnd = moment(new Date(periodEnd)).format('DD/MM/yyyy');

    this._chartService
      .getDoughnutChart(this.source, periodBegin, periodEnd)
      .subscribe({
        next: (data: HttpResponse<DoughnutChart>) => {
          this.foundData = true;

          if (data.status === 200) {
            const dataResponse = data.body;
            this.chartData = {
              labels: dataResponse.labels.slice(0, 10),
              datasets: [
                {
                  data: dataResponse.dataSets.slice(0, 10),
                  backgroundColor: ChartColors.analog.map(
                    (color) => color.backgroundColor
                  ),
                  borderColor: ChartColors.analog.map(
                    (color) => color.backgroundColor
                  ),
                  hoverOffset: 6,
                },
              ],
            };
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
