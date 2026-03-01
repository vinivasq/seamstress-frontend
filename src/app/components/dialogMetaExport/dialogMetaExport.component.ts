import { Component } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { CustomerExportRow } from 'src/app/models/CustomerExportRow';
import { CustomerService } from 'src/app/services/customer.service';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
  selector: 'app-dialog-meta-export',
  templateUrl: './dialogMetaExport.component.html',
  styleUrls: ['./dialogMetaExport.component.scss'],
})
export class DialogMetaExportComponent {
  filterType: 'createdAt' | 'orderDate' = 'createdAt';
  fromDate: Date | null = null;
  toDate: Date | null = null;

  constructor(
    private _customerService: CustomerService,
    private _toastrService: ToastrService,
    private _spinnerService: SpinnerService,
    private _dialogRef: MatDialogRef<DialogMetaExportComponent>
  ) {}

  export(): void {
    const params =
      this.filterType === 'createdAt'
        ? { fromCreatedAt: this.fromDate ?? undefined, toCreatedAt: this.toDate ?? undefined }
        : { fromOrderDate: this.fromDate ?? undefined, toOrderDate: this.toDate ?? undefined };

    this._spinnerService.isLoading = true;

    this._customerService
      .exportCustomers(params)
      .subscribe({
        next: (data: CustomerExportRow[]) => {
          if (!data || data.length === 0) {
            this._toastrService.warning('Nenhum cliente encontrado para os filtros selecionados', 'Sem resultados');
            return;
          }
          const csv = this.buildCSV(data);
          this.downloadCSV(csv, 'meta_audience.csv');
          this._dialogRef.close();
        },
        error: () => {
          this._toastrService.error('Não foi possível exportar os clientes', 'Erro de conexão');
        },
      })
      .add(() => (this._spinnerService.isLoading = false));
  }

  buildCSV(rows: CustomerExportRow[]): string {
    const header = 'email,phone,fn,ln,zip,ct,st,country,value';
    const lines = rows.map((r) => {
      const [fn, ...rest] = r.name.trim().split(' ');
      const ln = rest.join(' ');
      const phone = '+55' + r.phoneNumber.replace(/\D/g, '');
      const zip = String(r.cep).padStart(8, '0');
      return [r.email, phone, fn, ln, zip, r.city, r.uf, 'BR', r.ordersTotal].join(',');
    });
    return [header, ...lines].join('\n');
  }

  private downloadCSV(csv: string, filename: string): void {
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }
}
