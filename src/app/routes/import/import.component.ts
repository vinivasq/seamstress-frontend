import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ImportColumnMapping } from 'src/app/models/import/ImportColumnMapping';
import { ImportPreview } from 'src/app/models/import/ImportPreview';
import { ImportResult } from 'src/app/models/import/ImportResult';
import { ImportUploadResult } from 'src/app/models/import/ImportUploadResult';
import { ImportService } from 'src/app/services/import.service';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
  selector: 'app-import',
  templateUrl: './import.component.html',
  styleUrls: ['./import.component.scss'],
})
export class ImportComponent implements OnInit {
  currentStep = 1; // 1=upload, 2=mapping, 3=preview, 4=result
  file: File | null = null;
  uploadResult: ImportUploadResult | null = null;
  preview: ImportPreview | null = null;
  importResult: ImportResult | null = null;
  user: any;
  isAdmin = false;

  // NuvemShop platform ID — matches SalePlatforms table
  salePlatformId = 7;

  // Mapping fields
  seamstressFields = [
    { key: 'ExternalId', label: 'ID do Produto', required: true },
    { key: 'Name', label: 'Nome', required: true },
    { key: 'Price', label: 'Preço', required: true },
    { key: 'Fabric', label: 'Tecido (Categoria)', required: false },
    { key: 'Colors', label: 'Cores (Variantes)', required: false },
    { key: 'Sizes', label: 'Tamanhos', required: false },
    { key: 'ImageURL', label: 'URL da Imagem', required: false },
  ];

  mappings: { [seamstressField: string]: string } = {};

  constructor(
    private _importService: ImportService,
    private _spinner: SpinnerService,
    private _toastr: ToastrService,
    private _router: Router
  ) {}

  ngOnInit(): void {
    this.user = JSON.parse(localStorage.getItem('user')!);
    this.isAdmin = this.user?.role?.toLowerCase() === 'admin';
  }

  // Step 1: Upload
  onFileSelected(event: any): void {
    const files: File[] = event.addedFiles;
    if (files.length > 0) {
      this.file = files[0];
    }
  }

  onFileRemoved(): void {
    this.file = null;
  }

  uploadFile(): void {
    if (!this.file) return;

    this._spinner.isLoading = true;
    this._importService.uploadCsv(this.file, this.salePlatformId).subscribe({
      next: (result) => {
        this.uploadResult = result;

        // Auto-populate mappings from saved mapping
        if (result.savedMapping) {
          result.savedMapping.forEach((m) => {
            this.mappings[m.seamstressField] = m.csvColumn;
          });
          // If saved mapping exists and user is not admin, skip to preview
          if (!this.isAdmin) {
            this.generatePreview();
            return;
          }
        }

        this.currentStep = 2;
        this._spinner.isLoading = false;
      },
      error: (err) => {
        this._toastr.error('Erro ao processar arquivo CSV', 'Erro');
        this._spinner.isLoading = false;
      },
    });
  }

  // Step 2: Mapping
  get requiredMappingsFilled(): boolean {
    return this.seamstressFields
      .filter((f) => f.required)
      .every((f) => !!this.mappings[f.key]);
  }

  saveMapping(): void {
    if (!this.isAdmin) return;

    const mappingList: ImportColumnMapping[] = Object.entries(this.mappings)
      .filter(([_, csvCol]) => !!csvCol)
      .map(([seamstressField, csvColumn]) => ({ csvColumn, seamstressField }));

    this._spinner.isLoading = true;
    this._importService.saveMapping(this.salePlatformId, mappingList).subscribe({
      next: () => {
        this._toastr.success('Mapeamento salvo com sucesso');
        this._spinner.isLoading = false;
      },
      error: () => {
        this._toastr.error('Erro ao salvar mapeamento', 'Erro');
        this._spinner.isLoading = false;
      },
    });
  }

  generatePreview(): void {
    if (!this.uploadResult) return;

    const mappingList: ImportColumnMapping[] = Object.entries(this.mappings)
      .filter(([_, csvCol]) => !!csvCol)
      .map(([seamstressField, csvColumn]) => ({ csvColumn, seamstressField }));

    this._spinner.isLoading = true;
    this._importService
      .preview(this.uploadResult.sessionId, mappingList, this.salePlatformId)
      .subscribe({
        next: (preview) => {
          this.preview = preview;
          this.currentStep = 3;
          this._spinner.isLoading = false;
        },
        error: (err) => {
          this._toastr.error('Erro ao gerar preview', 'Erro');
          this._spinner.isLoading = false;
        },
      });
  }

  // Step 3: Preview → Execute
  executeImport(): void {
    if (!this.preview) return;

    this._spinner.isLoading = true;
    this._importService.executeImport(this.preview.sessionId).subscribe({
      next: (result) => {
        this.importResult = result;
        this.currentStep = 4;
        this._spinner.isLoading = false;
        this._toastr.success('Importação concluída!');
      },
      error: (err) => {
        this._toastr.error('Erro ao executar importação', 'Erro');
        this._spinner.isLoading = false;
      },
    });
  }

  // Navigation
  goBack(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  restart(): void {
    this.currentStep = 1;
    this.file = null;
    this.uploadResult = null;
    this.preview = null;
    this.importResult = null;
    this.mappings = {};
  }

  goToItems(): void {
    this._router.navigate(['/dashboard/items']);
  }
}
