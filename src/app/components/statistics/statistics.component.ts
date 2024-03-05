import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { StatisticComponent } from './statistic/statistic.component';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, MatCardModule, StatisticComponent],
  template: `
    <div class="statistics">
      <app-statistic
        value="R$ 1.234,99"
        label="Faturamento do mês atual"
        icon="bar_chart"
      ></app-statistic>

      <app-statistic
        value="Ecommerce"
        label="Top plataforma de venda"
        icon="bar_chart"
      ></app-statistic>

      <app-statistic
        value="Maxi Kaftan"
        label="Top modelo"
        icon="pie_chart"
      ></app-statistic>

      <app-statistic
        value="SP"
        label="Top região"
        icon="pie_chart"
      ></app-statistic>

      <app-statistic
        value="1234"
        label="Total de pedidos"
        icon="list"
      ></app-statistic>

      <app-statistic
        value="1234"
        label="Total de clientes"
        icon="people"
      ></app-statistic>

      <app-statistic
        value="1234"
        label="Total de modelos"
        icon="local_offer"
      ></app-statistic>
    </div>
  `,
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent {}
