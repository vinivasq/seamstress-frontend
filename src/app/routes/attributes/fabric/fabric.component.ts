import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { DialogComponent } from 'src/app/components/dialog/dialog.component';
import { Fabric } from 'src/app/models/Fabric';
import { AttributeService } from 'src/app/services/attribute.service';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
  selector: 'app-fabric',
  templateUrl: './fabric.component.html',
  styleUrls: ['./fabric.component.scss'],
})
export class FabricComponent implements OnInit {
  public fabrics: Fabric[];
  public inactiveFabrics: Fabric[];
  fabric: Fabric = { id: 0, name: '' };
  requestMethod = 'post';

  constructor(
    private _attributeService: AttributeService,
    private _toastrService: ToastrService,
    private _spinnerService: SpinnerService,
    private _dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getFabrics();
  }

  getFabrics() {
    this._spinnerService.isLoading = true;
    this._attributeService.setAttribute('fabric');

    this._attributeService
      .getAttributes()
      .subscribe({
        next: (data: Fabric[]) => {
          if (data?.length > 0) {
            this.fabrics = data.filter((fabric) => fabric.isActive);
            this.inactiveFabrics = data.filter((fabric) => !fabric.isActive);
          }
        },
        error: () => {
          this._toastrService.error(
            'Não foi possível listar os Tecidos',
            'Erro ao Listar'
          );
        },
      })
      .add(() => (this._spinnerService.isLoading = false));
  }

  saveFabric() {
    this._attributeService[this.requestMethod](this.fabric).subscribe({
      next: () => {
        this._toastrService.success(
          'Tecido cadastrado com sucesso',
          'Cadastrado com sucesso'
        );

        this.getFabrics();
        this.clearFabric();
      },
      error: () => {
        this._toastrService.error(
          'Houve um erro inesperado',
          'Erro ao cadastrar'
        );
      },
    });
  }

  clearFabric() {
    this.fabric.id = 0;
    this.fabric.name = '';
    this.requestMethod = 'post';
  }

  loadFabric(id: number) {
    this._attributeService.getAttributeById(id).subscribe({
      next: (data: Fabric) => {
        this.fabric.id = data.id;
        this.fabric.name = data.name;

        this.requestMethod = 'put';
      },
      error: () =>
        this._toastrService.error(
          'Não foi possível carregar o tecido',
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
              title: `Deseja inativar o tecido ${name}?`,
              content: `Existem itens de pedido com este tecido, sua exclusão não será possível.
                Deseja inativar?`,
              action: () => this.setActiveState(id, false),
            },
          });
        } else {
          this._dialog.open(DialogComponent, {
            data: {
              title: `Deseja excluir o tecido ${name}?`,
              content: 'Tem certeza que deseja excluir o tecido?',
              action: () => this.deleteFabric(id),
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
      next: (data: HttpResponse<Fabric>) => {
        if (data.status === 200) {
          if (data.body.isActive === state) {
            if (state === false) {
              this._toastrService.success('Tecido inativado');
            } else {
              this._toastrService.success('Tecido habilitado');
            }
          } else {
            this._toastrService.warning('O tecido não foi alterado');
          }
        } else {
          this._toastrService.warning('Houve um problema ao alterar o tecido');
        }
        this.getFabrics();
      },
      error: (error: HttpErrorResponse) =>
        this._toastrService.error(error.error, 'Erro ao alterar o tecido'),
    });
  }

  deleteFabric(id: number) {
    this._attributeService.delete(id).subscribe({
      next: () => {
        this._toastrService.success(
          'Tecido deletado com sucesso',
          'Deletado com sucesso'
        );
        this.getFabrics();
      },
      error: () => {
        this._toastrService.error(
          'Não foi possível deletar o tecido',
          'Erro ao deletar'
        );
      },
    });
  }
}
