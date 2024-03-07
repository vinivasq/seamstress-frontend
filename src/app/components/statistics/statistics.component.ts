import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { StatisticComponent } from './statistic/statistic.component';
import data from 'src/app/json/statistics.json';

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
      ></app-statistic>
    </div>
  `,
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent {
  statistics = data;
}
