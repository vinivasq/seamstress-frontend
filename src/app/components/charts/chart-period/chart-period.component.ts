import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import moment from 'moment';
@Component({
  selector: 'app-char-period',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatSelectModule],
  template: `
    <mat-form-field appearance="outline">
      <mat-label>Período</mat-label>
      <mat-select (valueChange)="setFilterValue($event)" value="monthly">
        <mat-option *ngFor="let filter of filterOptions" [value]="filter.value">
          {{ filter.text }}
        </mat-option>
      </mat-select>
    </mat-form-field>
  `,
  styleUrls: ['./chart-period.component.scss'],
})
export class ChartPeriodComponent implements OnInit {
  @Output() valueChange = new EventEmitter<string>();

  filterOptions = [
    {
      text: 'Esta Semana',
      value: 'weekly',
      startDate: moment().startOf('week').toISOString(true),
      endDate: moment().endOf('week').toISOString(true),
    },
    {
      text: 'Este Mês',
      value: 'monthly',
      startDate: moment().startOf('month').toISOString(true),
      endDate: moment().endOf('month').toISOString(true),
    },
    {
      text: 'Este Ano',
      value: 'yearly',
      startDate: moment().startOf('year').toISOString(true),
      endDate: moment().endOf('year').toISOString(true),
    },
  ];

  ngOnInit() {
    moment.locale('pt-br');
    this.setFilterValue('monthly');
  }

  setFilterValue(value: string) {
    const { startDate, endDate } = this.filterOptions.find(
      (option) => option.value === value
    );
    this.valueChange.emit(`${startDate}&${endDate}`);
  }
}
