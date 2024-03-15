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
      <mat-select (valueChange)="setFilterValue($event)" value="weekly">
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
      startDate: moment().subtract(moment().day(), 'day').toISOString(),
    },
    {
      text: 'Este Mes',
      value: 'monthly',
      startDate: moment()
        .subtract(moment().date() - 1, 'day')
        .toISOString(),
    },
    {
      text: 'Este Ano',
      value: 'yearly',
      startDate: moment()
        .subtract(moment().dayOfYear() - 1, 'day')
        .toISOString(),
    },
  ];

  ngOnInit() {
    this.setFilterValue('weekly');
  }

  setFilterValue(value: string) {
    const { startDate } = this.filterOptions.find(
      (option) => option.value === value
    );

    const period = `${startDate}&${moment().toISOString()}`;

    this.valueChange.emit(period);
  }
}
