import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ImportPreview } from 'src/app/models/import/ImportPreview';
import { ImportResult } from 'src/app/models/import/ImportResult';
import { ImportService } from 'src/app/services/import.service';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
})
export class ImportComponent {
  currentStep = 1; // 1=preview, 2=result
  preview: ImportPreview | null = null;
  importResult: ImportResult | null = null;

  constructor(
    private _importService: ImportService,
    private _spinner: SpinnerService,
    private _toastr: ToastrService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.fetchPreview();
  }

  fetchPreview(): void {
    this._spinner.isLoading = true;
    this._importService.fetchNuvemShopPreview().subscribe({
      next: (preview: ImportPreview) => {
        if (!preview.sessionId) {
          this._toastr.warning('Nenhum produto publicado encontrado na NuvemShop.', 'Aviso');
          this._router.navigate(['/dashboard/items']);
        } else {
          this.preview = preview;
        }
        this._spinner.isLoading = false;
      },
      error: () => {
        this._toastr.error('Erro ao buscar produtos da NuvemShop. Tente novamente.', 'Erro');
        this._spinner.isLoading = false;
        this._router.navigate(['/dashboard/items']);
      }
    });
  }

  executeImport(): void {
    if (!this.preview) return;

    this._spinner.isLoading = true;
    this._importService.executeImport(this.preview.sessionId).subscribe({
      next: (result) => {
        this.importResult = result;
        this.currentStep = 2;
        this._spinner.isLoading = false;
        this._toastr.success('Importação concluída!');
      },
      error: (err) => {
        this._toastr.error('Erro ao executar importação', 'Erro');
        this._spinner.isLoading = false;
      },
    });
  }

  restart(): void {
    this.currentStep = 1;
    this.preview = null;
    this.importResult = null;
  }

  goToItems(): void {
    this._router.navigate(['/dashboard/items']);
  }
}
