import { Component, EventEmitter, Input, Output } from '@angular/core';
import { ImportResult } from 'src/app/models/import/ImportResult';

@Component({
  selector: 'app-import-result',
  templateUrl: './importResult.component.html',
  styleUrls: ['./importResult.component.scss'],
})
export class ImportResultComponent {
  @Input() result: ImportResult | null = null;
  @Output() restart = new EventEmitter<void>();
  @Output() goToItems = new EventEmitter<void>();
}
