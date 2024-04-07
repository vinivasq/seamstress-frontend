import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-statistic',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatIconModule],
  template: `
    <mat-card class="statistic elevation">
      <mat-icon
        [ngStyle]="{ 'background-color': backGroundColor, color: color }"
      >
        {{ icon }}
      </mat-icon>
      <div class="statistic__content">
        <span>{{ value }}</span>
        <p>{{ label }}</p>
      </div>
    </mat-card>
  `,
  styleUrls: ['./statistic.component.scss'],
})
export class StatisticComponent {
  @Input() value: string;
  @Input() label: string;
  @Input() icon: string;
  @Input() color: string;
  @Input() backGroundColor: string;
}
