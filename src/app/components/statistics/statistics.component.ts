import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { StatisticComponent } from './statistic/statistic.component';
import { Statistic } from 'src/app/models/viewModels/Statistic';
import { StatisticsMapping } from 'src/helpers/statisticsMapping';
import { StatisticsService } from 'src/app/services/statistics.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, MatCardModule, StatisticComponent],
  template: `
    <div class="statistics">
      <app-statistic
        *ngFor="let statistic of statistics"
        value="{{ statistic.value }}"
        label="{{ statistic.label }}"
        icon="{{ statistic.icon }}"
        color="{{ statistic.color }}"
        backGroundColor="{{ statistic.backGroundColor }}"
      ></app-statistic>
    </div>
  `,
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements OnInit {
  statistics: Statistic[];

  constructor(
    private _statisticsService: StatisticsService,
    private _toastrService: ToastrService
  ) {}

  ngOnInit() {
    this.getStatistics();
  }

  getStatistics() {
    this._statisticsService.getStatistics().subscribe({
      next: (data: Statistic[]) => {
        this.statistics = data.map((data): Statistic => {
          const { icon, color, backGroundColor } =
            StatisticsMapping.mapping[data.label];
          return {
            label: data.label,
            value: data.value,
            icon,
            color,
            backGroundColor,
          };
        });
      },
      error: (error: Error) => {
        this._toastrService.error('Erro ao recuperar estatísticas');
        console.log(error);
      },
    });
  }
}
