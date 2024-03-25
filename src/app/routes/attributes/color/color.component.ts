import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { DialogComponent } from 'src/app/components/dialog/dialog.component';
import { Color } from 'src/app/models/Color';
import { AttributeService } from 'src/app/services/attribute.service';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
  selector: 'app-color',
  templateUrl: './color.component.html',
  styleUrls: ['./color.component.scss'],
})
export class ColorComponent implements OnInit {
  public colors: Color[];
  color: Color = { id: 0, name: '' };
  requestMethod = 'post';

  constructor(
    private _attributeService: AttributeService,
    private _toastrService: ToastrService,
    private _spinnerService: SpinnerService,
    private _dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getColors();
  }

  getColors() {
    this._spinnerService.isLoading = true;
    this._attributeService.setAttribute('color');

    this._attributeService
      .getAttributes()
      .subscribe({
        next: (data: Color[]) => {
          this.colors = data;
        },
        error: () => {
          this._toastrService.error(
            'Não foi possível listar as cores',
            'Erro ao Listar'
          );
        },
      })
      .add(() => (this._spinnerService.isLoading = false));
  }

  saveColor() {
    this._attributeService[this.requestMethod](this.color).subscribe({
      next: () => {
        this._toastrService.success(
          'Cor cadastrada com sucesso',
          'Cadastrado com sucesso'
        );

        this.getColors();
        this.clearColor();
      },
      error: () => {
        this._toastrService.error(
          'Houve um erro inesperado',
          'Erro ao cadastrar'
        );
      },
    });
  }

  clearColor() {
    this.color.id = 0;
    this.color.name = '';
    this.requestMethod = 'post';
  }

  loadColor(id: number) {
    this._attributeService.getAttributeById(id).subscribe({
      next: (data: Color) => {
        this.color.id = data.id;
        this.color.name = data.name;

        this.requestMethod = 'put';
      },
      error: () =>
        this._toastrService.error(
          'Não foi possível carregar a cor',
          'Erro ao carregar'
        ),
    });
  }

  openModal(id: number, name: string) {
    this._attributeService.checkFK(id).subscribe({
      next: (data: boolean) => {
        if (data === true) {
          this._dialog.open(DialogComponent, {
            data: {
              title: `Deseja inativar a cor ${name}?`,
              content: `Existem itens de pedido com esta cor, sua exclusão não será possível.
                Deseja inativar?`,
              action: () => this.setActiveState(id, false),
            },
          });
        } else {
          this._dialog.open(DialogComponent, {
            data: {
              title: `Deseja excluir a cor ${name}?`,
              content: 'Tem certeza que deseja excluir a cor?',
              action: () => this.deleteColor(id),
            },
          });
        }
      },
      error: (error: HttpErrorResponse) =>
        this._toastrService.error(error.error),
    });
  }

  setActiveState(id: number, state: boolean) {
    this._attributeService.setActiveState(id, state).subscribe({
      next: (data: Color) => {
        console.log(data);

        if (data.isActive === state) {
          this._toastrService.success('Cor inativada');
        } else {
          this._toastrService.warning('A cor não foi alterada');
        }
      },
      error: (error: HttpErrorResponse) =>
        this._toastrService.error(error.error, 'Erro ao alterar a cor'),
    });
  }

  deleteColor(id: number) {
    this._attributeService.delete(id).subscribe({
      next: () => {
        this._toastrService.success(
          'Cor deletada com sucesso',
          'Deletado com sucesso'
        );
        this.getColors();
      },
      error: () => {
        this._toastrService.error(
          'Não foi possível deletar a cor',
          'Erro ao deletar'
        );
      },
    });
  }
}
