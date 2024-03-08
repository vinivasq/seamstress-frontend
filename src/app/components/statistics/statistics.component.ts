import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { StatisticComponent } from './statistic/statistic.component';
import { Statistic } from 'src/app/models/viewModels/Statistic';
import data from 'src/app/json/statistics.json';
import { StatisticsMapping } from 'src/helpers/statisticsMapping';

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

  ngOnInit(): void {
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
  }
}
