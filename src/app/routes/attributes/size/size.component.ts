import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { DialogComponent } from 'src/app/components/dialog/dialog.component';
import { Size } from 'src/app/models/Size';
import { AttributeService } from 'src/app/services/attribute.service';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
  selector: 'app-size',
  templateUrl: './size.component.html',
  styleUrls: ['./size.component.scss'],
})
export class SizeComponent implements OnInit {
  public sizes: Size[];
  size: Size = { id: 0, name: '' };

  constructor(
    private _attributeService: AttributeService,
    private _toastrService: ToastrService,
    private _spinnerService: SpinnerService,
    private _dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getSizes();
  }

  getSizes() {
    this._spinnerService.isLoading = true;
    this._attributeService.setAttribute('size');

    this._attributeService
      .getAttributes()
      .subscribe({
        next: (data: Size[]) => {
          this.sizes = data;
        },
        error: () => {
          this._toastrService.error(
            'Não foi possível listar os Tamanhos',
            'Erro ao Listar'
          );
        },
      })
      .add(() => (this._spinnerService.isLoading = false));
  }

  saveSize() {
    this._attributeService.post(this.size).subscribe({
      next: () => {
        this._toastrService.success(
          'Tamanho cadastrado com sucesso',
          'Cadastrado com sucesso'
        );

        this.getSizes();
      },
      error: () => {
        this._toastrService.error(
          'Houve um erro inesperado',
          'Erro ao cadastrar'
        );
      },
    });
  }

  openModal(id: number, name: string) {
    this._dialog.open(DialogComponent, {
      data: {
        title: `Deseja excluir o tamanho ${name}?`,
        content: 'Tem certeza que deseja excluir o tamanho?',
        action: () => this.deleteSize(id),
      },
    });
  }

  deleteSize(id: number) {
    this._attributeService.delete(id).subscribe({
      next: () => {
        this._toastrService.success(
          'Tamanho deletado com sucesso',
          'Deletado com sucesso'
        );
        this.getSizes();
      },
      error: () => {
        this._toastrService.error(
          'Não foi possível deletar o tamanho',
          'Erro ao deletar'
        );
      },
    });
  }
}
