import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-register-item',
  templateUrl: './dialogRegisterItem.component.html',
  styleUrls: ['./dialogRegisterItem.component.scss'],
})
export class DialogRegisterItemComponent {
  constructor(private _dialogRef: MatDialogRef<DialogRegisterItemComponent>) {}

  select(option: string): void {
    this._dialogRef.close(option);
  }
}
