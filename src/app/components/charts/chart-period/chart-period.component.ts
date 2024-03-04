import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';

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
export class ChartPeriodComponent {
  @Output() valueChange = new EventEmitter<string>();

  filterOptions = [
    {
      text: 'Esta Semana',
      value: 'weekly',
    },
    {
      text: 'Este Mes',
      value: 'monthly',
    },
    {
      text: 'Este Ano',
      value: 'yearly',
    },
    {
      text: 'Período',
      value: new Date(),
    },
  ];

  setFilterValue(value: string) {
    this.valueChange.emit(value);
  }
}
